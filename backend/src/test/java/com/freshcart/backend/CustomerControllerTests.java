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
class CustomerControllerTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private MockMvc mockMvc;

    private final List<Integer> createdCustomerIds = new ArrayList<>();
    private final List<Integer> createdUserIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @AfterEach
    void tearDown() {
        for (Integer customerId : createdCustomerIds) {
            jdbcTemplate.update("DELETE FROM customer_profile_audit WHERE customer_id = ?", customerId);
            jdbcTemplate.update("DELETE FROM addresses WHERE customer_id = ?", customerId);
            jdbcTemplate.update("DELETE FROM customers WHERE customer_id = ?", customerId);
        }
        for (Integer userId : createdUserIds) {
            jdbcTemplate.update("DELETE FROM users WHERE user_id = ?", userId);
        }
        createdCustomerIds.clear();
        createdUserIds.clear();
    }

    @Test
    void testRegisterValidationFailureReturnsBadRequest() throws Exception {
        String invalidJson = """
        {
            "username": "",
            "password": "",
            "firstName": "",
            "lastName": "",
            "email": "invalid-email",
            "phone": ""
        }
        """;

        mockMvc.perform(post("/api/customers/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.username", notNullValue()))
                .andExpect(jsonPath("$.errors.password", notNullValue()))
                .andExpect(jsonPath("$.errors.email", notNullValue()));
    }

    @Test
    void testGetNonExistentCustomerReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/customers/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Customer not found")));
    }

    @Test
    void testGetPurchaseSummaryForNonExistentCustomerReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/customers/999999/purchase-summary"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Customer not found")));
    }

    @Test
    void testCustomerEndToEndLifecycle() throws Exception {
        long uniqueSuffix = System.currentTimeMillis() % 10000000;
        String username = "cust_" + uniqueSuffix;
        String email = "cust_" + uniqueSuffix + "@freshcart.com";
        String phone = "+9477" + String.format("%06d", uniqueSuffix % 1000000);

        // 1. Register Customer
        String regJson = """
        {
            "username": "%s",
            "password": "SecurePass123!",
            "firstName": "John",
            "lastName": "Doe",
            "email": "%s",
            "phone": "%s"
        }
        """.formatted(username, email, phone);

        MvcResult regResult = mockMvc.perform(post("/api/customers/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(regJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.customerId", notNullValue()))
                .andExpect(jsonPath("$.data.username", is(username)))
                .andExpect(jsonPath("$.data.fullName", is("John Doe")))
                .andExpect(jsonPath("$.data.email", is(email)))
                .andReturn();

        String responseBody = regResult.getResponse().getContentAsString();
        Integer customerId = JsonPath.read(responseBody, "$.data.customerId");
        Integer userId = JsonPath.read(responseBody, "$.data.userId");
        createdCustomerIds.add(customerId);
        createdUserIds.add(userId);

        // 2. View Customer
        mockMvc.perform(get("/api/customers/" + customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerId", is(customerId)))
                .andExpect(jsonPath("$.data.username", is(username)))
                .andExpect(jsonPath("$.data.email", is(email)));

        // 3. Search Customer using Stored Procedure
        mockMvc.perform(get("/api/customers").param("search", username))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].username", is(username)));

        // 4. Update Profile
        String updateJson = """
        {
            "firstName": "Johnny",
            "lastName": "Doe",
            "email": "%s",
            "phone": "%s"
        }
        """.formatted(email, phone);

        mockMvc.perform(put("/api/customers/" + customerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName", is("Johnny")))
                .andExpect(jsonPath("$.data.fullName", is("Johnny Doe")));

        // 5. Add Address
        String addAddressJson = """
        {
            "addressLine": "123 Main Street",
            "city": "Colombo",
            "province": "Western",
            "postalCode": "00100",
            "isDefault": true
        }
        """;

        MvcResult addAddressResult = mockMvc.perform(post("/api/customers/" + customerId + "/addresses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(addAddressJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.addressId", notNullValue()))
                .andExpect(jsonPath("$.data.city", is("Colombo")))
                .andExpect(jsonPath("$.data.isDefault", is(true)))
                .andReturn();

        Integer addressId = JsonPath.read(addAddressResult.getResponse().getContentAsString(), "$.data.addressId");

        // 6. Update Address
        String updateAddressJson = """
        {
            "addressLine": "456 Galle Road",
            "city": "Colombo",
            "province": "Western",
            "postalCode": "00300",
            "isDefault": true
        }
        """;

        mockMvc.perform(put("/api/customers/" + customerId + "/addresses/" + addressId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateAddressJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addressLine", is("456 Galle Road")))
                .andExpect(jsonPath("$.data.postalCode", is("00300")));

        // 7. Get Customer Addresses
        mockMvc.perform(get("/api/customers/" + customerId + "/addresses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].addressLine", is("456 Galle Road")));

        // 8. Purchase Summary
        mockMvc.perform(get("/api/customers/" + customerId + "/purchase-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerId", is(customerId)))
                .andExpect(jsonPath("$.data.totalOrders", is(0)))
                .andExpect(jsonPath("$.data.completedOrPaidOrderValue", is(0.0)));
    }
}
