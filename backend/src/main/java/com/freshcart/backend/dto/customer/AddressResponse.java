package com.freshcart.backend.dto.customer;

public class AddressResponse {

    private Integer addressId;
    private Integer customerId;
    private String addressLine;
    private String city;
    private String province;
    private String postalCode;
    private Boolean isDefault;

    public AddressResponse() {}

    public AddressResponse(Integer addressId, Integer customerId, String addressLine, String city, String province, String postalCode, Boolean isDefault) {
        this.addressId = addressId;
        this.customerId = customerId;
        this.addressLine = addressLine;
        this.city = city;
        this.province = province;
        this.postalCode = postalCode;
        this.isDefault = isDefault;
    }

    public Integer getAddressId() {
        return addressId;
    }

    public void setAddressId(Integer addressId) {
        this.addressId = addressId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
