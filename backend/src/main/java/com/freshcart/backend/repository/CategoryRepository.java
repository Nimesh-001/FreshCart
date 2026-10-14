package com.freshcart.backend.repository;

import com.freshcart.backend.dto.category.CategoryResponse;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository {

    Integer createCategory(String categoryName, String description);

    void updateCategory(Integer categoryId, String categoryName, String description);

    void deactivateCategory(Integer categoryId);

    Optional<CategoryResponse> findById(Integer categoryId);

    List<CategoryResponse> findAll(Boolean activeOnly);

    boolean existsById(Integer categoryId);

    boolean existsByName(String categoryName);

    boolean existsByNameAndNotId(String categoryName, Integer categoryId);
}
