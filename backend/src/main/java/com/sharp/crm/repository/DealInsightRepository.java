package com.sharp.crm.repository;

import com.sharp.crm.model.DealInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DealInsightRepository extends JpaRepository<DealInsight, Long> {
    Optional<DealInsight> findByStage(String stage);
}