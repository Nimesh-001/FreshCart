package com.freshcart.backend;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.exception.GlobalExceptionHandler;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTests {

    private MockMvc mockMvc;

    public static class SampleValidationDto {
        @NotBlank(message = "Name is required")
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    @RestController
    static class TestDummyController {
        @PostMapping("/test/validate")
        public ApiResponse<String> testValidation(@Valid @RequestBody SampleValidationDto dto) {
            return ApiResponse.success("Valid", dto.getName());
        }

        @GetMapping("/test/db-error")
        public ApiResponse<Void> testDatabaseError() {
            throw new DataRetrievalFailureException("SELECT * FROM secret_table WHERE password = 'secret'");
        }
    }

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(new TestDummyController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testValidationFailureReturnsConsistentJsonError() throws Exception {
        mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors.name", is("Name is required")));
    }

    @Test
    void testDatabaseErrorSanitizesMessageAndHidesRawSql() throws Exception {
        mockMvc.perform(get("/test/db-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("A database error occurred while processing your request. Please try again later.")))
                .andExpect(jsonPath("$.data", nullValue()))
                .andExpect(jsonPath("$.errors", nullValue()));
    }
}
