package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/db")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkDatabaseHealth() {
        try {
            Integer probe = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            String currentCatalog = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);

            if (probe != null && probe == 1) {
                Map<String, Object> details = new LinkedHashMap<>();
                details.put("status", "UP");
                details.put("database", currentCatalog);
                details.put("queryCheck", "SUCCESS");

                return ResponseEntity.ok(ApiResponse.success("Database connection is healthy", details));
            } else {
                Map<String, Object> details = new LinkedHashMap<>();
                details.put("status", "DOWN");

                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(ApiResponse.error("Database check returned an unexpected result", details));
            }
        } catch (Exception ex) {
            log.error("Database health check failed: {}", ex.getMessage());
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("status", "DOWN");

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("Database connection is unavailable", details));
        }
    }
}
