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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class ReviewAndReportControllerTests {

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
    private final List<Integer> createdReviewIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @AfterEach
    void tearDown() {
        for (Integer reviewId : createdReviewIds) {
            jdbcTemplate.update("DELETE FROM review_audit_log WHERE review_id = ?", reviewId);
            jdbcTemplate.update("DELETE FROM reviews WHERE review_id = ?", reviewId);
        }

        for (Integer orderId : createdOrderIds) {
            jdbcTemplate.update("DELETE FROM review_audit_log WHERE review_id IN (SELECT review_id FROM reviews WHERE order_id = ?)", orderId);
            jdbcTemplate.update("DELETE FROM reviews WHERE order_id = ?", orderId);
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

        createdReviewIds.clear();
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
                "INSERT INTO customers (user_id, first_name, last_name, email, phone) VALUES (?, 'Review', 'User', ?, ?)",
                userId, email, phone
        );
        Integer customerId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdCustomerIds.add(customerId);
        return customerId;
    }

    private Integer createTestAddress(Integer customerId) {
        jdbcTemplate.update(
                "INSERT INTO addresses (customer_id, address_line, city, province, postal_code, is_default) VALUES (?, '789 High Level Rd', 'Nugegoda', 'Western', '10250', TRUE)",
                customerId
        );
        Integer addressId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdAddressIds.add(addressId);
        return addressId;
    }

    private Integer createTestCategory(String name) {
        jdbcTemplate.update("INSERT INTO categories (category_name, description, is_active) VALUES (?, 'Review Test Category', TRUE)", name);
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

    private Integer createDeliveredOrder(Integer customerId, Integer addressId, Integer productId, int quantity, BigDecimal unitPrice) throws Exception {
        // 1. Add item to cart
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": %d}
                        """.formatted(customerId, productId, quantity)))
                .andExpect(status().isOk());

        // 2. Checkout
        MvcResult checkoutRes = mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "addressId": %d}
                        """.formatted(customerId, addressId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer orderId = JsonPath.read(checkoutRes.getResponse().getContentAsString(), "$.data.orderId");
        createdOrderIds.add(orderId);

        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity));

        // 3. Process payment
        mockMvc.perform(post("/api/payments/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "customerId": %d, "paymentMethod": "CARD", "amount": %s}
                        """.formatted(orderId, customerId, total.toString())))
                .andExpect(status().isCreated());

        // 4. Assign delivery
        mockMvc.perform(post("/api/deliveries/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"orderId": %d, "deliveryPerson": "Test Driver", "deliveryPhone": "+94770001122"}
                        """.formatted(orderId)))
                .andExpect(status().isCreated());

        // 5. Update delivery to DELIVERED (order status automatically becomes DELIVERED)
        mockMvc.perform(put("/api/deliveries/" + orderId + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"status": "DELIVERED"}
                        """))
                .andExpect(status().isOk());

        return orderId;
    }

    // 1. Add valid review
    @Test
    void test1_AddValidReview() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u1_" + suffix, "rev1_" + suffix + "@freshcart.com", "+9471" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd1_" + suffix, new BigDecimal("120.00"), 50);

        Integer orderId = createDeliveredOrder(customerId, addressId, productId, 2, new BigDecimal("120.00"));

        MvcResult result = mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "productId": %d,
                            "orderId": %d,
                            "rating": 5,
                            "comment": "Outstanding quality fresh apples!"
                        }
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.customerId", is(customerId)))
                .andExpect(jsonPath("$.data.productId", is(productId)))
                .andExpect(jsonPath("$.data.orderId", is(orderId)))
                .andExpect(jsonPath("$.data.rating", is(5)))
                .andExpect(jsonPath("$.data.ratingLabel", is("Positive")))
                .andExpect(jsonPath("$.data.comment", is("Outstanding quality fresh apples!")))
                .andReturn();

        Integer reviewId = JsonPath.read(result.getResponse().getContentAsString(), "$.data.reviewId");
        createdReviewIds.add(reviewId);

        // Verify review_audit_log contains 'INSERT' action from database trigger
        Integer auditCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM review_audit_log WHERE review_id = ? AND action_type = 'INSERT'",
                Integer.class,
                reviewId
        );
        assertEquals(1, auditCount);
    }

    // 2. Invalid rating
    @Test
    void test2_InvalidRatingValidation() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u2_" + suffix, "rev2_" + suffix + "@freshcart.com", "+9472" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd2_" + suffix, new BigDecimal("100.00"), 50);
        Integer orderId = createDeliveredOrder(customerId, addressId, productId, 1, new BigDecimal("100.00"));

        // Rating 0 (below min 1)
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 0, "comment": "Too low"}
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // Rating 6 (above max 5)
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 6, "comment": "Too high"}
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    // 3. Invalid/nonexistent product or not-delivered order
    @Test
    void test3_InvalidProductOrUndeliveredOrderReview() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u3_" + suffix, "rev3_" + suffix + "@freshcart.com", "+9473" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd3_" + suffix, new BigDecimal("80.00"), 50);

        // Test with nonexistent product ID 999999
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": 999999, "orderId": 1, "rating": 4, "comment": "Nice"}
                        """.formatted(customerId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));

        // Create an order that is only PENDING (not delivered)
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "quantity": 1}
                        """.formatted(customerId, productId)))
                .andExpect(status().isOk());

        MvcResult checkoutRes = mockMvc.perform(post("/api/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "addressId": %d}
                        """.formatted(customerId, addressId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer pendingOrderId = JsonPath.read(checkoutRes.getResponse().getContentAsString(), "$.data.orderId");
        createdOrderIds.add(pendingOrderId);

        // Attempt to review a pending (non-delivered) order -> 400 Bad Request
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 5, "comment": "Great"}
                        """.formatted(customerId, productId, pendingOrderId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("delivered order")));
    }

    // 4. Duplicate review prevention
    @Test
    void test4_DuplicateReviewProhibited() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u4_" + suffix, "rev4_" + suffix + "@freshcart.com", "+9474" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd4_" + suffix, new BigDecimal("150.00"), 50);
        Integer orderId = createDeliveredOrder(customerId, addressId, productId, 1, new BigDecimal("150.00"));

        // First review succeeds
        MvcResult res1 = mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 5, "comment": "First review"}
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = JsonPath.read(res1.getResponse().getContentAsString(), "$.data.reviewId");
        createdReviewIds.add(reviewId);

        // Second review attempt for same (customer, product, order) -> 409 Conflict
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 4, "comment": "Duplicate attempt"}
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already been submitted")));
    }

    // 5. Update own review
    @Test
    void test5_UpdateOwnReview() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u5_" + suffix, "rev5_" + suffix + "@freshcart.com", "+9475" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd5_" + suffix, new BigDecimal("200.00"), 50);
        Integer orderId = createDeliveredOrder(customerId, addressId, productId, 1, new BigDecimal("200.00"));

        MvcResult res = mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 5, "comment": "Initial comment"}
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = JsonPath.read(res.getResponse().getContentAsString(), "$.data.reviewId");
        createdReviewIds.add(reviewId);

        // Update rating to 3 ("Average") and comment
        mockMvc.perform(put("/api/reviews/" + reviewId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "rating": 3,
                            "comment": "Revised: it is average."
                        }
                        """.formatted(customerId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.reviewId", is(reviewId)))
                .andExpect(jsonPath("$.data.rating", is(3)))
                .andExpect(jsonPath("$.data.ratingLabel", is("Average")))
                .andExpect(jsonPath("$.data.comment", is("Revised: it is average.")));

        // Verify review_audit_log contains 'UPDATE' trigger entry
        Integer auditCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM review_audit_log WHERE review_id = ? AND action_type = 'UPDATE'",
                Integer.class,
                reviewId
        );
        assertEquals(1, auditCount);
    }

    // 6. Attempt to update another customer's review
    @Test
    void test6_AttemptToUpdateAnotherCustomersReview() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerA = createTestCustomer("rev_u6a_" + suffix, "rev6a_" + suffix + "@freshcart.com", "+9476" + suffix);
        Integer customerB = createTestCustomer("rev_u6b_" + suffix, "rev6b_" + suffix + "@freshcart.com", "+9477" + suffix);
        Integer addressA = createTestAddress(customerA);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd6_" + suffix, new BigDecimal("90.00"), 50);
        Integer orderId = createDeliveredOrder(customerA, addressA, productId, 1, new BigDecimal("90.00"));

        // Customer A creates review
        MvcResult res = mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 5, "comment": "Customer A's review"}
                        """.formatted(customerA, productId, orderId)))
                .andExpect(status().isCreated())
                .andReturn();

        Integer reviewId = JsonPath.read(res.getResponse().getContentAsString(), "$.data.reviewId");
        createdReviewIds.add(reviewId);

        // Customer B attempts to update Customer A's review -> 400 Bad Request (ownership violation)
        mockMvc.perform(put("/api/reviews/" + reviewId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "customerId": %d,
                            "rating": 1,
                            "comment": "Malicious edit attempt"
                        }
                        """.formatted(customerB)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("owner")));
    }

    // 7. Review analysis retrieval
    @Test
    void test7_ReviewAnalysisRetrieval() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u7_" + suffix, "rev7_" + suffix + "@freshcart.com", "+9478" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd7_" + suffix, new BigDecimal("130.00"), 50);
        Integer orderId = createDeliveredOrder(customerId, addressId, productId, 1, new BigDecimal("130.00"));

        // Create review
        MvcResult res = mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {"customerId": %d, "productId": %d, "orderId": %d, "rating": 4, "comment": "Good quality"}
                        """.formatted(customerId, productId, orderId)))
                .andExpect(status().isCreated())
                .andReturn();

        createdReviewIds.add(JsonPath.read(res.getResponse().getContentAsString(), "$.data.reviewId"));

        // Retrieve review analysis for specific product
        mockMvc.perform(get("/api/reviews/analysis/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].productId", is(productId)))
                .andExpect(jsonPath("$.data[0].totalReviews", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data[0].averageRating", notNullValue()))
                .andExpect(jsonPath("$.data[0].overallRatingLabel", is("Positive")));

        // Retrieve review analysis across all products
        mockMvc.perform(get("/api/reviews/analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())));
    }

    // 8. Sales report retrieval
    @Test
    void test8_SalesReportRetrieval() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(7);
        LocalDate endDate = today.plusDays(1);

        mockMvc.perform(get("/api/reports/sales?startDate=" + startDate + "&endDate=" + endDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));

        // Retrieve overall sales report without parameters
        mockMvc.perform(get("/api/reports/sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }

    // 9. Customer purchase report retrieval
    @Test
    void test9_CustomerPurchaseReportRetrieval() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(30);
        LocalDate endDate = today.plusDays(1);

        mockMvc.perform(get("/api/reports/customer-purchases?startDate=" + startDate + "&endDate=" + endDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));

        // All customer purchase report without date parameters
        mockMvc.perform(get("/api/reports/customer-purchases"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }

    // 10. Customer-specific purchase report & summary
    @Test
    void test10_CustomerSpecificPurchaseReportAndSummary() throws Exception {
        long suffix = System.currentTimeMillis() % 10000000;
        Integer customerId = createTestCustomer("rev_u10_" + suffix, "rev10_" + suffix + "@freshcart.com", "+9479" + suffix);
        Integer addressId = createTestAddress(customerId);
        Integer categoryId = createTestCategory("RevCat_" + suffix);
        Integer productId = createTestProduct(categoryId, "RevProd10_" + suffix, new BigDecimal("250.00"), 50);
        createDeliveredOrder(customerId, addressId, productId, 2, new BigDecimal("250.00")); // Total 500.00

        // Customer purchase report filtered by customerId
        mockMvc.perform(get("/api/reports/customer-purchases?customerId=" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].customerId", is(customerId)))
                .andExpect(jsonPath("$.data[0].totalOrders", is(1)))
                .andExpect(jsonPath("$.data[0].totalPurchaseAmount", is(500.00)))
                .andExpect(jsonPath("$.data[0].averageOrderValue", is(500.00)));

        // Customer purchase summary via stored procedure
        mockMvc.perform(get("/api/reports/customer-summary/" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.customerId", is(customerId)))
                .andExpect(jsonPath("$.data.totalOrders", is(1)))
                .andExpect(jsonPath("$.data.completedOrPaidOrderValue", is(500.00)));
    }

    // 11. Report filtering and date validation
    @Test
    void test11_ReportDateValidation() throws Exception {
        // Invalid date range: startDate after endDate
        mockMvc.perform(get("/api/reports/sales?startDate=2026-12-31&endDate=2026-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("date")));

        // Partial date range (only startDate provided)
        mockMvc.perform(get("/api/reports/sales?startDate=2026-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Both start date and end date must be provided")));
    }

    // 12. Empty / no-data report behavior
    @Test
    void test12_EmptyReportBehavior() throws Exception {
        // Querying a date range in the far future where no sales exist
        mockMvc.perform(get("/api/reports/sales?startDate=2099-01-01&endDate=2099-01-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    // 13. Verify fn_review_rating_label behavior with actual integer and decimal values
    @Test
    void test13_VerifyReviewRatingFunctionBehavior() {
        String label5 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(5)", String.class);
        String label4 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(4)", String.class);
        String label3 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(3)", String.class);
        String label2 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(2)", String.class);
        String label1 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(1)", String.class);
        String labelNull = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(NULL)", String.class);

        assertEquals("Positive", label5);
        assertEquals("Positive", label4);
        assertEquals("Average", label3);
        assertEquals("Negative", label2);
        assertEquals("Negative", label1);
        assertEquals("Not Rated", labelNull);

        // Test decimal values when passed to the function: MySQL coerces DECIMAL to TINYINT
        String labelDec45 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(4.5)", String.class);
        String labelDec35 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(3.5)", String.class);
        String labelDec24 = jdbcTemplate.queryForObject("SELECT fn_review_rating_label(2.4)", String.class);

        assertEquals("Positive", labelDec45); // 4.5 rounds to 5 -> Positive
        assertEquals("Positive", labelDec35); // 3.5 rounds to 4 -> Positive
        assertEquals("Negative", labelDec24); // 2.4 rounds to 2 -> Negative
    }
}
