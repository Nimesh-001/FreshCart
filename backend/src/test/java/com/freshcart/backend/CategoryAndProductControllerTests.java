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

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class CategoryAndProductControllerTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private MockMvc mockMvc;

    private final List<Integer> createdProductIds = new ArrayList<>();
    private final List<Integer> createdCategoryIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @AfterEach
    void tearDown() {
        for (Integer productId : createdProductIds) {
            jdbcTemplate.update("DELETE FROM product_audit_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory_audit_log WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM inventory WHERE product_id = ?", productId);
            jdbcTemplate.update("DELETE FROM products WHERE product_id = ?", productId);
        }
        for (Integer categoryId : createdCategoryIds) {
            jdbcTemplate.update("DELETE FROM categories WHERE category_id = ?", categoryId);
        }
        createdProductIds.clear();
        createdCategoryIds.clear();
    }

    @Test
    void testCategoryValidationFailure() throws Exception {
        String invalidJson = """
        {
            "categoryName": "",
            "description": "Too long..."
        }
        """;

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.categoryName", notNullValue()));
    }

    @Test
    void testCategoryLifecycle() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        String categoryName = "Cat_" + uniqueSuffix;

        // 1. Create Category
        String createJson = """
        {
            "categoryName": "%s",
            "description": "Fresh test category"
        }
        """.formatted(categoryName);

        MvcResult createResult = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.categoryId", notNullValue()))
                .andExpect(jsonPath("$.data.categoryName", is(categoryName)))
                .andExpect(jsonPath("$.data.isActive", is(true)))
                .andReturn();

        Integer categoryId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.data.categoryId");
        createdCategoryIds.add(categoryId);

        // 2. Duplicate Category Name Returns Conflict (409)
        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)));

        // 3. Update Category
        String updateJson = """
        {
            "categoryName": "%s_Updated",
            "description": "Updated description"
        }
        """.formatted(categoryName);

        mockMvc.perform(put("/api/categories/" + categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryName", is(categoryName + "_Updated")))
                .andExpect(jsonPath("$.data.description", is("Updated description")));

        // 4. View Category by ID
        mockMvc.perform(get("/api/categories/" + categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryId", is(categoryId)))
                .andExpect(jsonPath("$.data.categoryName", is(categoryName + "_Updated")));

        // 5. Deactivate Category
        mockMvc.perform(delete("/api/categories/" + categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 6. View Deactivated Category
        mockMvc.perform(get("/api/categories/" + categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive", is(false)));
    }

    @Test
    void testProductLifecycleAndPerformance() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        String categoryName = "ProdCat_" + uniqueSuffix;

        // 1. Create a Category first
        String catJson = """
        {
            "categoryName": "%s",
            "description": "Category for product testing"
        }
        """.formatted(categoryName);

        MvcResult catResult = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(catJson))
                .andExpect(status().isCreated())
                .andReturn();

        Integer categoryId = JsonPath.read(catResult.getResponse().getContentAsString(), "$.data.categoryId");
        createdCategoryIds.add(categoryId);

        // 2. Add Product to Category
        String productName = "Organic Apples " + uniqueSuffix;
        String productJson = """
        {
            "categoryId": %d,
            "productName": "%s",
            "description": "Crisp red apples",
            "price": 250.50,
            "reorderLevel": 10,
            "initialQuantity": 50
        }
        """.formatted(categoryId, productName);

        MvcResult prodResult = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.productId", notNullValue()))
                .andExpect(jsonPath("$.data.productName", is(productName)))
                .andExpect(jsonPath("$.data.price", is(250.50)))
                .andExpect(jsonPath("$.data.stockQuantity", is(50)))
                .andExpect(jsonPath("$.data.stockStatus", is("IN STOCK")))
                .andReturn();

        Integer productId = JsonPath.read(prodResult.getResponse().getContentAsString(), "$.data.productId");
        createdProductIds.add(productId);

        // 3. View Product by ID
        mockMvc.perform(get("/api/products/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productId", is(productId)))
                .andExpect(jsonPath("$.data.categoryName", is(categoryName)))
                .andExpect(jsonPath("$.data.stockQuantity", is(50)));

        // 4. Update Product
        String updateProductJson = """
        {
            "categoryId": %d,
            "productName": "%s Updated",
            "description": "Updated crisp red apples",
            "price": 275.00,
            "reorderLevel": 15,
            "isActive": true
        }
        """.formatted(categoryId, productName);

        mockMvc.perform(put("/api/products/" + productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateProductJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productName", is(productName + " Updated")))
                .andExpect(jsonPath("$.data.price", is(275.00)))
                .andExpect(jsonPath("$.data.reorderLevel", is(15)));

        // 5. Search Products
        mockMvc.perform(get("/api/products")
                        .param("search", "Apples " + uniqueSuffix)
                        .param("categoryId", String.valueOf(categoryId))
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].productName", is(productName + " Updated")));

        // 6. Product Performance Analysis (Single Product)
        mockMvc.perform(get("/api/products/" + productId + "/performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].productId", is(productId)))
                .andExpect(jsonPath("$.data[0].productName", is(productName + " Updated")))
                .andExpect(jsonPath("$.data[0].unitsSold", is(0)))
                .andExpect(jsonPath("$.data[0].salesRevenue", is(0.0)));

        // 7. Product Performance Analysis (All Products)
        mockMvc.perform(get("/api/products/performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void testNonExistentProductReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Product not found")));
    }
}
