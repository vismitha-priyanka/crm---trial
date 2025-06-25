package com.sharp.crm.repository;

import com.sharp.crm.model.ActivityStat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityStatRepository extends JpaRepository<ActivityStat, Long> {
}