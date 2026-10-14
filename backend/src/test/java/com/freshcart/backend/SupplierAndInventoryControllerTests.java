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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class SupplierAndInventoryControllerTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private MockMvc mockMvc;

    private final List<Integer> createdSupplierIds = new ArrayList<>();
    private final List<Integer> createdProductIds = new ArrayList<>();
    private final List<Integer> createdCategoryIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @AfterEach
    void tearDown() {
        for (Integer productId : createdProductIds) {
            jdbcTemplate.update("DELETE FROM inventory_movement_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory_audit_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM product_suppliers WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM product_audit_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM products WHERE product_id = ?", productId);
        }

        for (Integer supplierId : createdSupplierIds) {
            jdbcTemplate.update("DELETE FROM inventory_movement_log WHERE supplier_id = ?", supplierId);
            jdbcTemplate.update("DELETE FROM product_suppliers WHERE supplier_id = ?", supplierId);
            jdbcTemplate.update("DELETE FROM suppliers WHERE supplier_id = ?", supplierId);
        }

        for (Integer categoryId : createdCategoryIds) {
            jdbcTemplate.update("DELETE FROM categories WHERE category_id = ?", categoryId);
        }

        createdProductIds.clear();
        createdSupplierIds.clear();
        createdCategoryIds.clear();
    }

    private Integer createTestCategory(String name) {
        jdbcTemplate.update("INSERT INTO categories (category_name, description, is_active) VALUES (?, ?, TRUE)",
                name, "Test description");
        Integer categoryId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdCategoryIds.add(categoryId);
        return categoryId;
    }

    private Integer createTestProduct(Integer categoryId, String name, int reorderLevel, int initialQuantity) {
        jdbcTemplate.update(
                "INSERT INTO products (category_id, product_name, description, price, reorder_level, is_active) VALUES (?, ?, ?, ?, ?, TRUE)",
                categoryId, name, "Test product description", new BigDecimal("10.00"), reorderLevel
        );
        Integer productId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        jdbcTemplate.update("INSERT INTO inventory (product_id, quantity) VALUES (?, ?)", productId, initialQuantity);
        createdProductIds.add(productId);
        return productId;
    }

    private Integer createTestSupplier(String name, String email, String phone) {
        jdbcTemplate.update(
                "INSERT INTO suppliers (supplier_name, contact_person, email, phone, address, is_active) VALUES (?, ?, ?, ?, ?, TRUE)",
                name, "Contact Person", email, phone, "123 Test Street"
        );
        Integer supplierId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        createdSupplierIds.add(supplierId);
        return supplierId;
    }

    @Test
    void testAddSupplierValidationFailure() throws Exception {
        String invalidJson = """
        {
            "supplierName": "",
            "email": "invalid-email"
        }
        """;

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.supplierName", notNullValue()))
                .andExpect(jsonPath("$.errors.email", notNullValue()));
    }

    @Test
    void testAddSupplierLifecycleAndDuplicateHandling() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        String email = "supplier_" + uniqueSuffix + "@freshcart.com";
        String phone = "+94" + (700000000 + (uniqueSuffix % 100000000));
        String supplierName = "Supplier_" + uniqueSuffix;

        String createJson = """
        {
            "supplierName": "%s",
            "contactPerson": "John Doe",
            "email": "%s",
            "phone": "%s",
            "address": "45 Market Street"
        }
        """.formatted(supplierName, email, phone);

        MvcResult createResult = mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.supplierId", notNullValue()))
                .andExpect(jsonPath("$.data.supplierName", is(supplierName)))
                .andExpect(jsonPath("$.data.email", is(email)))
                .andExpect(jsonPath("$.data.phone", is(phone)))
                .andExpect(jsonPath("$.data.isActive", is(true)))
                .andReturn();

        Integer supplierId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.data.supplierId");
        createdSupplierIds.add(supplierId);

        // Fetch supplier by ID
        mockMvc.perform(get("/api/suppliers/" + supplierId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.supplierId", is(supplierId)))
                .andExpect(jsonPath("$.data.supplierName", is(supplierName)));

        // Attempt to create supplier with duplicate email
        String duplicateEmailJson = """
        {
            "supplierName": "Another Supplier",
            "email": "%s",
            "phone": "+94711111111"
        }
        """.formatted(email);

        mockMvc.perform(post("/api/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(duplicateEmailJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)));

        // Fetch all active suppliers
        mockMvc.perform(get("/api/suppliers?activeOnly=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }

    @Test
    void testProductSupplierManagement() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "Prod_" + uniqueSuffix, 10, 20);
        Integer supplierId = createTestSupplier("Sup_" + uniqueSuffix, "sup_" + uniqueSuffix + "@test.com", "+9472" + uniqueSuffix);

        // 1. Assign supplier to product
        String assignJson = """
        {
            "supplierId": %d,
            "supplierPrice": 8.50
        }
        """.formatted(supplierId);

        mockMvc.perform(post("/api/products/" + productId + "/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.productId", is(productId)))
                .andExpect(jsonPath("$.data.supplierId", is(supplierId)))
                .andExpect(jsonPath("$.data.supplierPrice", is(8.50)));

        // 2. Duplicate assignment should fail with 409
        mockMvc.perform(post("/api/products/" + productId + "/suppliers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)));

        // 3. List product suppliers
        mockMvc.perform(get("/api/products/" + productId + "/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].supplierId", is(supplierId)));

        // 4. Update supplier price
        String updatePriceJson = """
        {
            "supplierPrice": 9.25
        }
        """;

        mockMvc.perform(put("/api/products/" + productId + "/suppliers/" + supplierId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePriceJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.supplierPrice", is(9.25)));

        // 5. Remove supplier link
        mockMvc.perform(delete("/api/products/" + productId + "/suppliers/" + supplierId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 6. Verify removed
        mockMvc.perform(get("/api/products/" + productId + "/suppliers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void testReceiveStock() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "StockProd_" + uniqueSuffix, 10, 5);
        Integer supplierId = createTestSupplier("StockSup_" + uniqueSuffix, "stock_" + uniqueSuffix + "@test.com", "+9473" + uniqueSuffix);

        String receiveJson = """
        {
            "productId": %d,
            "supplierId": %d,
            "quantity": 25,
            "supplierPrice": 12.00
        }
        """.formatted(productId, supplierId);

        mockMvc.perform(post("/api/inventory/receive-stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(receiveJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.productId", is(productId)))
                .andExpect(jsonPath("$.data.previousQuantity", is(5)))
                .andExpect(jsonPath("$.data.quantityChange", is(25)))
                .andExpect(jsonPath("$.data.newQuantity", is(30)))
                .andExpect(jsonPath("$.data.operationType", is("STOCK_IN")));

        // Verify database state directly
        Integer actualQty = jdbcTemplate.queryForObject("SELECT quantity FROM inventory WHERE product_id = ?", Integer.class, productId);
        assertEquals(30, actualQty);

        // Verify movement log
        Integer movementCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM inventory_movement_log WHERE product_id = ? AND movement_type = 'STOCK_IN'",
                Integer.class, productId
        );
        assertEquals(1, movementCount);

        // Test receiving invalid quantity
        String invalidReceive = """
        {
            "productId": %d,
            "supplierId": %d,
            "quantity": 0,
            "supplierPrice": 10.00
        }
        """.formatted(productId, supplierId);

        mockMvc.perform(post("/api/inventory/receive-stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidReceive))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void testAdjustInventory() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        Integer productId = createTestProduct(categoryId, "AdjustProd_" + uniqueSuffix, 10, 20);

        // 1. Positive adjustment
        String increaseJson = """
        {
            "productId": %d,
            "quantityChange": 5,
            "reason": "Found uncounted stock during audit"
        }
        """.formatted(productId);

        mockMvc.perform(post("/api/inventory/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(increaseJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.previousQuantity", is(20)))
                .andExpect(jsonPath("$.data.quantityChange", is(5)))
                .andExpect(jsonPath("$.data.newQuantity", is(25)))
                .andExpect(jsonPath("$.data.operationType", is("ADJUSTMENT")));

        // 2. Negative adjustment
        String decreaseJson = """
        {
            "productId": %d,
            "quantityChange": -10,
            "reason": "Damaged goods discarded"
        }
        """.formatted(productId);

        mockMvc.perform(post("/api/inventory/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(decreaseJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.previousQuantity", is(25)))
                .andExpect(jsonPath("$.data.quantityChange", is(-10)))
                .andExpect(jsonPath("$.data.newQuantity", is(15)));

        // 3. Excess negative adjustment should fail
        String excessiveDecreaseJson = """
        {
            "productId": %d,
            "quantityChange": -50,
            "reason": "Too much reduction"
        }
        """.formatted(productId);

        mockMvc.perform(post("/api/inventory/adjust")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(excessiveDecreaseJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // 4. Verify trigger wrote to inventory_audit_log
        Integer auditCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM inventory_audit_log WHERE product_id = ?",
                Integer.class, productId
        );
        assertTrue(auditCount != null && auditCount >= 2);
    }

    @Test
    void testLowStockRetrieval() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        Integer categoryId = createTestCategory("Cat_" + uniqueSuffix);
        // Product with reorder level 15, current stock 10 -> LOW STOCK
        Integer lowStockProductId = createTestProduct(categoryId, "LowStock_" + uniqueSuffix, 15, 10);

        MvcResult result = mockMvc.perform(get("/api/inventory/low-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        List<Integer> lowStockIds = JsonPath.read(responseBody, "$.data[*].productId");
        assertTrue(lowStockIds.contains(lowStockProductId));
    }
}
