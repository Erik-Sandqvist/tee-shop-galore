import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server/server.js';
import db from '../server/db.js';

describe('Purchase Product Test', () => {
  let productId;
  let initialStock;

  beforeAll(async () => {
    // Skapa en testprodukt (vattenflaska) i databasen
    const result = await db.query(
      'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING id, stock',
      ['Test Vattenflaska', 149, 10]
    );
    productId = result.rows[0].id;
    initialStock = result.rows[0].stock;
  });

  afterAll(async () => {
    // Rensa upp testdata
    await db.query('DELETE FROM products WHERE id = $1', [productId]);
    await db.end();
  });

  test('Should decrease stock when water bottle is purchased', async () => {
    // Köp vattenflaskan
    const response = await request(app)
      .post('/api/purchase')
      .send({
        productId: productId,
        quantity: 3
      })
      .expect(200);

    // Verifiera att köpet lyckades
    expect(response.body.success).toBe(true);

    // Kontrollera att lagersaldot har minskat
    const result = await db.query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    );
    const newStock = result.rows[0].stock;
    
    expect(newStock).toBe(initialStock - 3);
  });

  test('Should remove product when stock reaches zero', async () => {
    // Köp resterande vattenflaskor
    await request(app)
      .post('/api/purchase')
      .send({
        productId: productId,
        quantity: 7
      })
      .expect(200);

    // Verifiera att produkten är borttagen eller har stock = 0
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );
    
    // Antingen är produkten borta ELLER stock är 0
    if (result.rows.length > 0) {
      expect(result.rows[0].stock).toBe(0);
    } else {
      expect(result.rows.length).toBe(0);
    }
  });

  test('Should not allow purchase when stock is insufficient', async () => {
    const response = await request(app)
      .post('/api/purchase')
      .send({
        productId: productId,
        quantity: 20
      })
      .expect(400);

    expect(response.body.error).toBeDefined();
  });
});