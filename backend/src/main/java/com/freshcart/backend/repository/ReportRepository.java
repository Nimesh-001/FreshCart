package com.freshcart.backend.repository;

import com.freshcart.backend.dto.report.CustomerPurchaseReportResponse;
import com.freshcart.backend.dto.report.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.report.SalesReportResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReportRepository {

    List<SalesReportResponse> getSalesReport(LocalDate startDate, LocalDate endDate);

    List<SalesReportResponse> getSalesReportAll();

    List<CustomerPurchaseReportResponse> getCustomerPurchaseReport(LocalDate startDate, LocalDate endDate);

    List<CustomerPurchaseReportResponse> getCustomerPurchaseReportAll();

    Optional<CustomerPurchaseReportResponse> getCustomerPurchaseReportByCustomerId(Integer customerId);

    Optional<CustomerPurchaseSummaryResponse> getCustomerPurchaseSummary(Integer customerId);
}
