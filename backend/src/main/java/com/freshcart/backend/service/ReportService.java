package com.freshcart.backend.service;

import com.freshcart.backend.dto.report.CustomerPurchaseReportResponse;
import com.freshcart.backend.dto.report.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.report.SalesReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    List<SalesReportResponse> getSalesReport(LocalDate startDate, LocalDate endDate);

    List<CustomerPurchaseReportResponse> getCustomerPurchaseReport(LocalDate startDate, LocalDate endDate, Integer customerId);

    CustomerPurchaseSummaryResponse getCustomerPurchaseSummary(Integer customerId);
}
