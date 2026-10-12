package com.freshcart.backend;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class CartAndOrderControllerTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private MockMvc mockMvc;

    private final List<Integer> createdUserIds = new ArrayList<>();
    private final List<Integer> createdCustomerIds = new ArrayList<>();
    private final List<Integer> createdAddressIds = new ArrayList<>();
    private final List<Integer> createdCategoryIds = new ArrayList<>();
    private final List<Integer> createdProductIds = new ArrayList<>();
    private final List<Integer> createdOrderIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @AfterEach
    void tearDown() {
        for (Integer orderId : createdOrderIds) {
            jdbcTemplate.update("DELETE FROM payments WHERE order_id = ?", orderId);
            jdbcTemplate.update("DELETE FROM order_items WHERE order_id = ?", orderId);
            jdbcTemplate.update("DELETE FROM order_status_audit WHERE order_id = ?", orderId);
            jdbcTemplate.update("DELETE FROM orders WHERE order_id = ?", orderId);
        }

        for (Integer customerId : createdCustomerIds) {
            List<Integer> cartIds = jdbcTemplate.queryForList("SELECT cart_id FROM carts WHERE customer_id = ?", Integer.class, customerId);
            for (Integer cartId : cartIds) {
                jdbcTemplate.update("DELETE FROM cart_items WHERE cart_id = ?", cartId);
            }
            jdbcTemplate.update("DELETE FROM carts WHERE customer_id = ?", customerId);
        }

        for (Integer productId : createdProductIds) {
            jdbcTemplate.update("DELETE FROM cart_items WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory_movement_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory_audit_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM product_suppliers WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM product_audit_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM products WHERE product_id = ?", productId);
        }

        for (Integer addressId : createdAddressIds) {
            jdbcTemplate.update("DELETE FROM addresses WHERE address_id = ?", addressId);
        }

        for (Integer customerId : createdCustomerIds) {
            jdbcTemplate.update("DELETE FROM customer_profile_audit WHERE customer_id = ?", customerId);
            jdbcTemplate.update("DELETE FROM customers WHERE customer_id = ?", customerId);
        }

        for (Integer userId : createdUserIds) {
            jdbcTemplate.update("DELETE FROM users WHERE user_id = ?", userId);
        }

        for (Integer categoryId : createdCategoryIds) {
            jdbcTemplate.update("DELETE FROM categories WHERE category_id = ?", categoryId);
        }

        createdOrderIds.clear();
        createdProductIds.clear();
        createdAddressIds.clear();
        createdCustomerIds.clear();
        createdUserIds.clear();
        createdCategoryIds.clear();
    }

    private Integer createTestCustomer(String username, String email, String phone) {
        jdbcTemplate.update(
                "INSERT INTO users (username, password_hash, role, is_active) VALUES (?, 'test_hash', 'CUSTOMER', TRUE)",
                username
        );
        Integer userId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdUserIds.add(userId);

        jdbcTemplate.update(
                "INSERT INTO customers (user_id, first_name, last_name, email, phone) VALUES (?, 'TestFirst', 'TestLast', ?, ?)",
                userId, email, phone
        );
        Integer customerId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdCustomerIds.add(customerId);
        return customerId;
    }

    private Integer createTestAddress(Integer customerId) {
        jdbcTemplate.update(
                "INSERT INTO addresses (customer_id, address_line, city, province, postal_code, is_default) VALUES (?, '123 Market St', 'Colombo', 'Western', '00100', TRUE)",
                customerId
        );
        Integer addressId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdAddressIds.add(addressId);
        return addressId;
    }

    private Integer createTestCategory(String name) {
        jdbcTemplate.update("INSERT INTO categories (category_name, description, is_active) VALUES (?, 'Test Category', TRUE)", name);
        Integer categoryId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdCategoryIds.add(categoryId);
        return categoryId;
    }

    private Integer createTestProduct(Integer categoryId, String name, BigDecimal price, int initialStock, boolean isActive) {
        jdbcTemplate.update(
                "INSERT INTO products (category_id, product_name, description, price, reorder_level, is_active) VALUES (?, ?, 'Product Description', ?, 5, ?)",
                categoryId, name, price, isActive
        );
        Integer productId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdProductIds.add(productId);

        jdbcTemplate.update("INSERT INTO inventory (product_id, quantity) VALUES (?, ?)", productId, initialStock);
        return productId;
    }

    @Test
    void testAddToCartSuccessAndTotals() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("cart_user_" + uniqueSuffix, "cart_" + uniqueSuffix + "@freshcart.com", "+9471" + uniqueSuffix);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "Prod1_" + uniqueSuffix, new BigDecimal("150.00"), 50, true);

        String addJson = """
        {
            "customerId": %d,
            "productId": %d,
            "quantity": 2
        }
        """.formatted(customerId, productId);

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.customerId", is(customerId)))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.totalItems", is(1)))
                .andExpect(jsonPath("$.data.totalUnits", is(2)))
                .andExpect(jsonPath("$.data.totalAmount", is(300.00)))
                .andExpect(jsonPath("$.data.items[0].productId", is(productId)))
                .andExpect(jsonPath("$.data.items[0].quantity", is(2)))
                .andExpect(jsonPath("$.data.items[0].unitPrice", is(150.00)))
                .andExpect(jsonPath("$.data.items[0].subtotal", is(300.00)));

        // Retrieve current cart via GET
        mockMvc.perform(get("/api/cart?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.items", hasSize(1)));
    }

    @Test
    void testAddInvalidQuantityOrInactiveProduct() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("invalid_user_" + uniqueSuffix, "inv_" + uniqueSuffix + "@freshcart.com", "+9472" + uniqueSuffix);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer inactiveProductId = createTestProduct(categoryId, "Inactive_" + uniqueSuffix, new BigDecimal("50.00"), 20, false);

        // 1. Invalid quantity (0 or negative)
        String zeroQuantityJson = """
        {
            "customerId": %d,
            "productId": %d,
            "quantity": 0
        }
        """.formatted(customerId, inactiveProductId);

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(zeroQuantityJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 2. Inactive product
        String inactiveJson = """
        {
            "customerId": %d,
            "productId": %d,
            "quantity": 1
        }
        """.formatted(customerId, inactiveProductId);

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(inactiveJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 3. Non-existent product
        String nonexistentJson = """
        {
            "customerId": %d,
            "productId": 9999999,
            "quantity": 1
        }
        """.formatted(customerId);

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nonexistentJson))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testUpdateCartItemAndRemoval() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("upd_user_" + uniqueSuffix, "upd_" + uniqueSuffix + "@freshcart.com", "+9473" + uniqueSuffix);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "Prod2_" + uniqueSuffix, new BigDecimal("100.00"), 30, true);

        // Initial add: 3 items
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "productId": %d,
                            "quantity": 3
                        }
                        """.formatted(customerId, productId)))
                .andExpect(status().isOk());

        // 1. Update quantity to 5
        mockMvc.perform(put("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "productId": %d,
                            "quantity": 5
                        }
                        """.formatted(customerId, productId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalUnits", is(5)))
                .andExpect(jsonPath("$.data.totalAmount", is(500.00)));

        // 2. Update quantity exceeding stock should fail
        mockMvc.perform(put("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "productId": %d,
                            "quantity": 100
                        }
                        """.formatted(customerId, productId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 3. Remove item via DELETE endpoint
        mockMvc.perform(delete("/api/cart/items/" + productId + "?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", hasSize(0)))
                .andExpect(jsonPath("$.data.totalItems", is(0)))
                .andExpect(jsonPath("$.data.totalAmount", is(0)));
    }

    @Test
    void testCheckoutLifecycleAndAtomicStockDeduction() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("co_user_" + uniqueSuffix, "co_" + uniqueSuffix + "@freshcart.com", "+9474" + uniqueSuffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId1 = createTestProduct(categoryId, "CheckProd1_" + uniqueSuffix, new BigDecimal("200.00"), 20, true);
        Integer productId2 = createTestProduct(categoryId, "CheckProd2_" + uniqueSuffix, new BigDecimal("50.00"), 15, true);

        // Add both products to cart
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": 3}
                        """.formatted(customerId, productId1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": 4}
                        """.formatted(customerId, productId2)))
                .andExpect(status().isOk());

        // Checkout: Total = (3 * 200) + (4 * 50) = 800.00
        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "addressId": %d,
                            "paymentMethod": "CASH_ON_DELIVERY"
                        }
                        """.formatted(customerId, addressId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderId", notNullValue()))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.totalAmount", is(800.00)))
                .andExpect(jsonPath("$.data.itemLineCount", is(2)))
                .andExpect(jsonPath("$.data.totalUnits", is(7)))
                .andExpect(jsonPath("$.data.paymentMethod", is("CASH_ON_DELIVERY")))
                .andReturn();

        Integer orderId = JsonPath.read(checkoutResult.getResponse().getContentAsString(), "$.data.orderId");
        createdOrderIds.add(orderId);

        // Verify stock deducted in inventory
        Integer stock1 = jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId1);
        Integer stock2 = jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId2);
        assertEquals(17, stock1); // 20 - 3 = 17
        assertEquals(11, stock2); // 15 - 4 = 11

        // Verify previous cart is marked CHECKED_OUT
        String cartStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM carts WHERE customer_id = ? ORDER BY cart_id DESC LIMIT 1",
                String.class, customerId
        );
        assertEquals("CHECKED_OUT", cartStatus);

        // Retrieve order details
        mockMvc.perform(get("/api/orders/" + orderId + "?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.items", hasSize(2)));
    }

    @Test
    void testCheckoutRollbackWhenStockInsufficient() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rb_user_" + uniqueSuffix, "rb_" + uniqueSuffix + "@freshcart.com", "+9475" + uniqueSuffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "RollbackProd_" + uniqueSuffix, new BigDecimal("80.00"), 10, true);

        // Add 5 to cart
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": 5}
                        """.formatted(customerId, productId)))
                .andExpect(status().isOk());

        // Simulate concurrent stock reduction in inventory down to 2
        jdbcTemplate.update("UPDATE inventory SET quantity = 2 WHERE product_id = ?", productId);

        // Checkout should fail with 400 Insufficient stock
        mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "addressId": %d
                        }
                        """.formatted(customerId, addressId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // Verify atomicity: No orders created, cart remains ACTIVE, stock untouched at 2
        Integer orderCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders WHERE customer_id = ?", Integer.class, customerId);
        assertEquals(0, orderCount);

        String cartStatus = jdbcTemplate.queryForObject(
                "SELECT status FROM carts WHERE customer_id = ? ORDER BY cart_id DESC LIMIT 1",
                String.class, customerId
        );
        assertEquals("ACTIVE", cartStatus);

        Integer currentStock = jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId);
        assertEquals(2, currentStock);
    }

    @Test
    void testCancelOrderAndStockRestoration() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("cancel_user_" + uniqueSuffix, "cnl_" + uniqueSuffix + "@freshcart.com", "+9476" + uniqueSuffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "CancelProd_" + uniqueSuffix, new BigDecimal("120.00"), 40, true);

        // 1. Add to cart & checkout
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": 10}
                        """.formatted(customerId, productId)))
                .andExpect(status().isOk());

        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "addressId": %d}
                        """.formatted(customerId, addressId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer orderId = JsonPath.read(checkoutResult.getResponse().getContentAsString(), "$.data.orderId");
        createdOrderIds.add(orderId);

        // Stock after checkout should be 30
        Integer stockAfterCheckout = jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId);
        assertEquals(30, stockAfterCheckout);

        // 2. Cancel the order
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.status", is("CANCELLED")));

        // 3. Verify stock restored to 40
        Integer stockAfterCancel = jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId);
        assertEquals(40, stockAfterCancel);

        // 4. Repeated cancel should fail (status is no longer PENDING)
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel?customerId=" + customerId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testOrderHistoryRetrieval() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("hist_user_" + uniqueSuffix, "hist_" + uniqueSuffix + "@freshcart.com", "+9477" + uniqueSuffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "HistProd_" + uniqueSuffix, new BigDecimal("45.00"), 50, true);

        // Place Order 1
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": 2}
                        """.formatted(customerId, productId)))
                .andExpect(status().isOk());

        MvcResult coResult = mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "addressId": %d}
                        """.formatted(customerId, addressId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer orderId = JsonPath.read(coResult.getResponse().getContentAsString(), "$.data.orderId");
        createdOrderIds.add(orderId);

        // Fetch Order History via GET
        mockMvc.perform(get("/api/orders?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].orderId", is(orderId)))
                .andExpect(jsonPath("$.data[0].totalAmount", is(90.00)))
                .andExpect(jsonPath("$.data[0].totalUnits", is(2)));
    }

    @Test
    void testConcurrentCartAddMaintainsSingleActiveCart() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("concur_user_" + uniqueSuffix, "concur_" + uniqueSuffix + "@freshcart.com", "+9478" + uniqueSuffix);
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId1 = createTestProduct(categoryId, "CProd1_" + uniqueSuffix, new BigDecimal("10.00"), 100, true);
        Integer productId2 = createTestProduct(categoryId, "CProd2_" + uniqueSuffix, new BigDecimal("20.00"), 100, true);

        int threads = 4;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            final int prodId = (i % 2 == 0) ? productId1 : productId2;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    mockMvc.perform(post("/api/cart/items")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                            {"customerId": %d, "productId": %d, "quantity": 1}
                            """.formatted(customerId, prodId)));
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdown();

        // Verify exactly one active cart exists for this customer
        Integer activeCartCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM carts WHERE customer_id = ? AND status = 'ACTIVE'",
                Integer.class, customerId
        );
        assertEquals(1, activeCartCount);
    }
}
