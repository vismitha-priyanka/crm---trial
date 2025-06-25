package com.sharp.crm.service;

import com.sharp.crm.model.ActivityStat;
import com.sharp.crm.repository.ActivityStatRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityStatService {
    private final ActivityStatRepository repository;

    public ActivityStatService(ActivityStatRepository repository) {
        this.repository = repository;
    }

    public List<ActivityStat> findAll() { return repository.findAll(); }
    public ActivityStat save(ActivityStat stat) { return repository.save(stat); }
    public void delete(Long id) { repository.deleteById(id); }
    public Page<ActivityStat> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }
}