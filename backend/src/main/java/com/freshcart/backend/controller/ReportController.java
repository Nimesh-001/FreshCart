package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.report.CustomerPurchaseReportResponse;
import com.freshcart.backend.dto.report.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.report.SalesReportResponse;
import com.freshcart.backend.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<List<SalesReportResponse>>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<SalesReportResponse> response = reportService.getSalesReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Sales report retrieved successfully", response));
    }

    @GetMapping("/customer-purchases")
    public ResponseEntity<ApiResponse<List<CustomerPurchaseReportResponse>>> getCustomerPurchaseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer customerId
    ) {
        List<CustomerPurchaseReportResponse> response = reportService.getCustomerPurchaseReport(startDate, endDate, customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer purchase report retrieved successfully", response));
    }

    @GetMapping("/customer-summary/{customerId}")
    public ResponseEntity<ApiResponse<CustomerPurchaseSummaryResponse>> getCustomerPurchaseSummary(
            @PathVariable Integer customerId
    ) {
        CustomerPurchaseSummaryResponse response = reportService.getCustomerPurchaseSummary(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer purchase summary retrieved successfully", response));
    }
}
