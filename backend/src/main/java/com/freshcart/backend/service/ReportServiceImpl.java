package com.freshcart.backend.service;

import com.freshcart.backend.dto.report.CustomerPurchaseReportResponse;
import com.freshcart.backend.dto.report.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.report.SalesReportResponse;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final CustomerRepository customerRepository;

    public ReportServiceImpl(ReportRepository reportRepository, CustomerRepository customerRepository) {
        this.reportRepository = reportRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public List<SalesReportResponse> getSalesReport(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
            return reportRepository.getSalesReport(startDate, endDate);
        } else if (startDate != null || endDate != null) {
            throw new IllegalArgumentException("Both start date and end date must be provided for date range filtering");
        }

        return reportRepository.getSalesReportAll();
    }

    @Override
    public List<CustomerPurchaseReportResponse> getCustomerPurchaseReport(LocalDate startDate, LocalDate endDate, Integer customerId) {
        if (customerId != null && !customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        if (startDate != null && endDate != null) {
            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
            List<CustomerPurchaseReportResponse> list = reportRepository.getCustomerPurchaseReport(startDate, endDate);
            if (customerId != null) {
                return list.stream()
                        .filter(r -> r.getCustomerId().equals(customerId))
                        .toList();
            }
            return list;
        } else if (startDate != null || endDate != null) {
            throw new IllegalArgumentException("Both start date and end date must be provided for date range filtering");
        }

        if (customerId != null) {
            return reportRepository.getCustomerPurchaseReportByCustomerId(customerId)
                    .map(Collections::singletonList)
                    .orElse(Collections.emptyList());
        }

        return reportRepository.getCustomerPurchaseReportAll();
    }

    @Override
    public CustomerPurchaseSummaryResponse getCustomerPurchaseSummary(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return reportRepository.getCustomerPurchaseSummary(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase summary not found for customer ID: " + customerId));
    }
}
