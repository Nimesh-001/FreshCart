package com.freshcart.backend.dto.supplier;

import java.math.BigDecimal;
import java.sql.Date;

public class ProductSupplierResponse {

    private Integer productId;
    private String productName;
    private Integer supplierId;
    private String supplierName;
    private String contactPerson;
    private String supplierEmail;
    private String supplierPhone;
    private BigDecimal supplierPrice;
    private Date lastSuppliedDate;

    public ProductSupplierResponse() {}

    public ProductSupplierResponse(Integer productId, String productName, Integer supplierId, String supplierName, String contactPerson, String supplierEmail, String supplierPhone, BigDecimal supplierPrice, Date lastSuppliedDate) {
        this.productId = productId;
        this.productName = productName;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.contactPerson = contactPerson;
        this.supplierEmail = supplierEmail;
        this.supplierPhone = supplierPhone;
        this.supplierPrice = supplierPrice;
        this.lastSuppliedDate = lastSuppliedDate;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }

    public String getSupplierPhone() {
        return supplierPhone;
    }

    public void setSupplierPhone(String supplierPhone) {
        this.supplierPhone = supplierPhone;
    }

    public BigDecimal getSupplierPrice() {
        return supplierPrice;
    }

    public void setSupplierPrice(BigDecimal supplierPrice) {
        this.supplierPrice = supplierPrice;
    }

    public Date getLastSuppliedDate() {
        return lastSuppliedDate;
    }

    public void setLastSuppliedDate(Date lastSuppliedDate) {
        this.lastSuppliedDate = lastSuppliedDate;
    }
}
