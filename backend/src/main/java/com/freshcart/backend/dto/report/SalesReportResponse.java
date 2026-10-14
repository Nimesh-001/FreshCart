package com.freshcart.backend.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SalesReportResponse {

    private LocalDate salesDate;
    private Long totalOrders;
    private BigDecimal totalSales;
    private Long deliveredOrders;

    public SalesReportResponse() {}

    public SalesReportResponse(LocalDate salesDate, Long totalOrders, BigDecimal totalSales, Long deliveredOrders) {
        this.salesDate = salesDate;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
        this.deliveredOrders = deliveredOrders;
    }

    public LocalDate getSalesDate() {
        return salesDate;
    }

    public void setSalesDate(LocalDate salesDate) {
        this.salesDate = salesDate;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public Long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(Long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }
}
