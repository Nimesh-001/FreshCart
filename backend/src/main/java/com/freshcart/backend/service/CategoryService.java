package com.freshcart.backend.service;

import com.freshcart.backend.dto.category.CategoryRequest;
import com.freshcart.backend.dto.category.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Integer categoryId, CategoryRequest request);

    void deactivateCategory(Integer categoryId);

    CategoryResponse getCategoryById(Integer categoryId);

    List<CategoryResponse> getAllCategories(Boolean activeOnly);
}
