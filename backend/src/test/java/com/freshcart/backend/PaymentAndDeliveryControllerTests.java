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
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class PaymentAndDeliveryControllerTests {

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
            jdbcTemplate.update("DELETE FROM delivery_audit_log WHERE delivery_id IN (SELECT delivery_id FROM deliveries WHERE order_id = ?)", orderId);
            jdbcTemplate.update("DELETE FROM deliveries WHERE order_id = ?", orderId);
            jdbcTemplate.update("DELETE FROM payment_audit_log WHERE payment_id IN (SELECT payment_id FROM payments WHERE order_id = ?)", orderId);
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
                "INSERT INTO customers (user_id, first_name, last_name, email, phone) VALUES (?, 'Payment', 'Tester', ?, ?)",
                userId, email, phone
        );
        Integer customerId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdCustomerIds.add(customerId);
        return customerId;
    }

    private Integer createTestAddress(Integer customerId) {
        jdbcTemplate.update(
                "INSERT INTO addresses (customer_id, address_line, city, province, postal_code, is_default) VALUES (?, '456 Galle Rd', 'Colombo', 'Western', '00300', TRUE)",
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

    private Integer createTestProduct(Integer categoryId, String name, BigDecimal price, int initialStock) {
        jdbcTemplate.update(
                "INSERT INTO products (category_id, product_name, description, price, reorder_level, is_active) VALUES (?, ?, 'Product Description', ?, 5, TRUE)",
                categoryId, name, price
        );
        Integer productId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdProductIds.add(productId);

        jdbcTemplate.update("INSERT INTO inventory (product_id, quantity) VALUES (?, ?)", productId, initialStock);
        return productId;
    }

    private Integer createTestOrder(Integer customerId, Integer addressId, BigDecimal itemPrice, int quantity) throws Exception {
        Integer categoryId = createTestCategory("Cat_" + (System.currentTimeMillis() % 10000000));
        Integer productId = createTestProduct(categoryId, "Prod_" + (System.currentTimeMillis() % 10000000), itemPrice, quantity + 20);

        // Add to cart
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": %d}
                        """.formatted(customerId, productId, quantity)))
                .andExpect(status().isOk());

        // Checkout
        MvcResult checkoutResult = mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "addressId": %d}
                        """.formatted(customerId, addressId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer orderId = JsonPath.read(checkoutResult.getResponse().getContentAsString(), "$.data.orderId");
        createdOrderIds.add(orderId);
        return orderId;
    }

    // 1. Successful payment processing (Simulated CARD)
    @Test
    void test1_SuccessfulPaymentProcessingCard() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u1_" + suffix, "pay1_" + suffix + "@freshcart.com", "+9471" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("250.00"), 2); // Total 500.00

        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "orderId": %d,
                            "customerId": %d,
                            "paymentMethod": "CARD",
                            "amount": 500.00
                        }
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.paymentMethod", is("CARD")))
                .andExpect(jsonPath("$.data.amount", is(500.00)))
                .andExpect(jsonPath("$.data.paymentStatus", is("SUCCESS")))
                .andExpect(jsonPath("$.data.orderStatus", is("PAID")))
                .andExpect(jsonPath("$.data.isSimulated", is(true)))
                .andExpect(jsonPath("$.data.transactionReference", notNullValue()));

        // Verify order status in DB
        String dbOrderStatus = jdbcTemplate.queryForObject("SELECT status FROM orders WHERE order_id = ?", String.class, orderId);
        assertEquals("PAID", dbOrderStatus);

        // Verify payment audit log trigger
        Integer auditCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payment_audit_log WHERE payment_id IN (SELECT payment_id FROM payments WHERE order_id = ?)", Integer.class, orderId);
        assertNotNull(auditCount);
    }

    // 2. Invalid / duplicate payment
    @Test
    void test2_DuplicatePaymentPrevention() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u2_" + suffix, "pay2_" + suffix + "@freshcart.com", "+9472" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("100.00"), 1);

        // First payment succeeds
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "ONLINE", "amount": 100.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated());

        // Second payment attempt must be rejected with 409 CONFLICT
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "ONLINE", "amount": 100.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    // 3. Payment amount validation
    @Test
    void test3_PaymentAmountValidation() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u3_" + suffix, "pay3_" + suffix + "@freshcart.com", "+9473" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("150.00"), 2); // Total 300.00

        // Amount mismatch: sending 200.00 instead of 300.00
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "CARD", "amount": 200.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Payment amount does not match order total")));
    }

    // 4. COD payment behavior & COD status conflict check
    @Test
    void test4_CodPaymentBehaviorAndDeliveryConstraint() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u4_" + suffix, "pay4_" + suffix + "@freshcart.com", "+9474" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("200.00"), 1); // Total 200.00

        // Process COD payment
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "CASH_ON_DELIVERY", "amount": 200.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.paymentMethod", is("CASH_ON_DELIVERY")))
                .andExpect(jsonPath("$.data.paymentStatus", is("PENDING")))
                .andExpect(jsonPath("$.data.orderStatus", is("PENDING")))
                .andExpect(jsonPath("$.data.isSimulated", is(false)));

        // Verify database state: order remains PENDING
        String orderStatus = jdbcTemplate.queryForObject("SELECT status FROM orders WHERE order_id = ?", String.class, orderId);
        assertEquals("PENDING", orderStatus);

        // Attempt delivery assignment on this PENDING COD order -> rejected by database rules
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "orderId": %d,
                            "deliveryPerson": "Kamal Perera",
                            "deliveryPhone": "+94771234567"
                        }
                        """.formatted(orderId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("PENDING")));
    }

    // 5. Successful refund
    @Test
    void test5_SuccessfulRefund() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u5_" + suffix, "pay5_" + suffix + "@freshcart.com", "+9475" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("350.00"), 1);

        // Pay with CARD first
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "CARD", "amount": 350.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated());

        // Process refund
        mockMvc.perform(post("/api/payments/" + orderId + "/refund")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "reason": "Customer cancelled order before shipping"}
                        """.formatted(customerId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.paymentStatus", is("REFUNDED")))
                .andExpect(jsonPath("$.data.orderStatus", is("REFUNDED")))
                .andExpect(jsonPath("$.data.refundAmount", is(350.00)));

        // Verify DB state
        String paymentStatus = jdbcTemplate.queryForObject("SELECT payment_status FROM payments WHERE order_id = ?", String.class, orderId);
        String orderStatus = jdbcTemplate.queryForObject("SELECT status FROM orders WHERE order_id = ?", String.class, orderId);
        assertEquals("REFUNDED", paymentStatus);
        assertEquals("REFUNDED", orderStatus);
    }

    // 6. Invalid / duplicate refund
    @Test
    void test6_InvalidAndDuplicateRefund() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u6_" + suffix, "pay6_" + suffix + "@freshcart.com", "+9476" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("120.00"), 1);

        // Attempting refund before payment -> 404 Payment record not found
        mockMvc.perform(post("/api/payments/" + orderId + "/refund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));

        // Pay with CARD
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "CARD", "amount": 120.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated());

        // First refund succeeds
        mockMvc.perform(post("/api/payments/" + orderId + "/refund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Second refund attempt must fail with 400 Bad Request
        mockMvc.perform(post("/api/payments/" + orderId + "/refund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already been refunded")));
    }

    // 7. Delivery assignment
    @Test
    void test7_DeliveryAssignment() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u7_" + suffix, "pay7_" + suffix + "@freshcart.com", "+9477" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("500.00"), 1);

        // Pay first
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "CARD", "amount": 500.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated());

        // Assign delivery
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "orderId": %d,
                            "deliveryPerson": "Sunil Fernando",
                            "deliveryPhone": "+94772345678"
                        }
                        """.formatted(orderId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.deliveryPerson", is("Sunil Fernando")))
                .andExpect(jsonPath("$.data.deliveryPhone", is("+94772345678")))
                .andExpect(jsonPath("$.data.deliveryStatus", is("ASSIGNED")))
                .andExpect(jsonPath("$.data.orderStatus", is("PROCESSING")));

        // Verify order status in DB is PROCESSING
        String orderStatus = jdbcTemplate.queryForObject("SELECT status FROM orders WHERE order_id = ?", String.class, orderId);
        assertEquals("PROCESSING", orderStatus);
    }

    // 8. Duplicate delivery assignment prevention
    @Test
    void test8_DuplicateDeliveryAssignmentPrevention() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u8_" + suffix, "pay8_" + suffix + "@freshcart.com", "+9478" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("300.00"), 1);

        // Pay
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "ONLINE", "amount": 300.00}
                        """.formatted(orderId, customerId)))
                .andExpect(status().isCreated());

        // First assignment succeeds
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "orderId": %d,
                            "deliveryPerson": "Ravi Wickrama",
                            "deliveryPhone": "+94773456789"
                        }
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        // Second assignment attempt should be rejected with 409 CONFLICT
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "orderId": %d,
                            "deliveryPerson": "Another Person",
                            "deliveryPhone": "+94779999999"
                        }
                        """.formatted(orderId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already assigned")));
    }

    // 9. Delivery status update (ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED)
    @Test
    void test9_DeliveryStatusProgression() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u9_" + suffix, "pay9_" + suffix + "@freshcart.com", "+9479" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("400.00"), 1);

        // Pay and Assign
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "paymentMethod": "CARD", "amount": 400.00}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "deliveryPerson": "Nimal Silva", "deliveryPhone": "+94774567890"}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        // Step 1: Update to OUT_FOR_DELIVERY
        mockMvc.perform(put("/api/deliveries/" + orderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"status": "OUT_FOR_DELIVERY"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deliveryStatus", is("OUT_FOR_DELIVERY")))
                .andExpect(jsonPath("$.data.orderStatus", is("OUT_FOR_DELIVERY")));

        assertEquals("OUT_FOR_DELIVERY", jdbcTemplate.queryForObject("SELECT status FROM orders WHERE order_id = ?", String.class, orderId));

        // Step 2: Update to DELIVERED
        mockMvc.perform(put("/api/deliveries/" + orderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"status": "DELIVERED"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deliveryStatus", is("DELIVERED")))
                .andExpect(jsonPath("$.data.orderStatus", is("DELIVERED")))
                .andExpect(jsonPath("$.data.deliveredAt", notNullValue()));

        assertEquals("DELIVERED", jdbcTemplate.queryForObject("SELECT status FROM orders WHERE order_id = ?", String.class, orderId));
    }

    // 10. Invalid delivery status transition
    @Test
    void test10_InvalidDeliveryStatusTransition() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u10_" + suffix, "pay10_" + suffix + "@freshcart.com", "+9470" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("180.00"), 1);

        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "paymentMethod": "CARD", "amount": 180.00}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "deliveryPerson": "Kasun Raj", "deliveryPhone": "+94775678901"}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        // Update to DELIVERED
        mockMvc.perform(put("/api/deliveries/" + orderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"status": "DELIVERED"}
                        """))
                .andExpect(status().isOk());

        // Attempting to reopen DELIVERED order back to ASSIGNED -> 400 Bad Request
        mockMvc.perform(put("/api/deliveries/" + orderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"status": "ASSIGNED"}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Delivered orders cannot be reopened here")));
    }

    // 11. Cancelled / refunded order delivery restriction
    @Test
    void test11_CancelledAndRefundedOrderDeliveryRestriction() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u11_" + suffix, "pay11_" + suffix + "@freshcart.com", "+9471" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("220.00"), 1);

        // Cancel the order before payment
        mockMvc.perform(post("/api/orders/" + orderId + "/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d}
                        """.formatted(customerId)))
                .andExpect(status().isOk());

        // Attempt delivery assignment on cancelled order -> 400 Bad Request
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "deliveryPerson": "Kamal", "deliveryPhone": "+94776789012"}
                        """.formatted(orderId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("cancelled")));
    }

    // 12. Payment & delivery tracking
    @Test
    void test12_PaymentAndDeliveryTracking() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u12_" + suffix, "pay12_" + suffix + "@freshcart.com", "+9472" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("600.00"), 1);

        // Track before payment
        mockMvc.perform(get("/api/tracking/" + orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.orderStatus", is("PENDING")))
                .andExpect(jsonPath("$.data.totalAmount", is(600.00)))
                .andExpect(jsonPath("$.data.paymentId", nullValue()))
                .andExpect(jsonPath("$.data.deliveryId", nullValue()));

        // Pay
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "paymentMethod": "CARD", "amount": 600.00}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        // Assign delivery
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "deliveryPerson": "Gayan Perera", "deliveryPhone": "+94777890123"}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        // Track after payment & delivery assignment
        mockMvc.perform(get("/api/tracking/" + orderId + "?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.orderStatus", is("PROCESSING")))
                .andExpect(jsonPath("$.data.paymentMethod", is("CARD")))
                .andExpect(jsonPath("$.data.paymentStatus", is("SUCCESS")))
                .andExpect(jsonPath("$.data.deliveryPerson", is("Gayan Perera")))
                .andExpect(jsonPath("$.data.deliveryStatus", is("ASSIGNED")));

        // Search tracking with query filter
        mockMvc.perform(get("/api/tracking?deliveryStatus=ASSIGNED&paymentStatus=SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", not(empty())));
    }

    // 13. Concurrency test: simultaneous payment attempts
    @Test
    void test13_ConcurrentPaymentAttemptsSafety() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("pay_u13_" + suffix, "pay13_" + suffix + "@freshcart.com", "+9473" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer orderId = createTestOrder(customerId, addressId, new BigDecimal("450.00"), 1);

        int threads = 4;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    MvcResult res = mockMvc.perform(post("/api/payments/process")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("""
                                    {
                                        "orderId": %d,
                                        "customerId": %d,
                                        "paymentMethod": "CARD",
                                        "amount": 450.00
                                    }
                                    """.formatted(orderId, customerId)))
                            .andReturn();

                    int status = res.getResponse().getStatus();
                    if (status == 201) {
                        successCount.incrementAndGet();
                    } else if (status == 409 || status == 400) {
                        conflictCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // Ignored
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        finishLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Exactly 1 payment must succeed, remaining threads must fail
        assertEquals(1, successCount.get(), "Only 1 payment attempt should succeed");
        assertEquals(threads - 1, conflictCount.get(), "Concurrent payment attempts must be rejected");

        // Verify exactly 1 payment record in database
        Integer paymentCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM payments WHERE order_id = ?", Integer.class, orderId);
        assertEquals(1, paymentCount);
    }
}
