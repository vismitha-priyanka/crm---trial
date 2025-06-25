package com.sharp.crm.service;

import com.sharp.crm.model.DealInsight;
import com.sharp.crm.repository.DealInsightRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DealInsightService {
    private final DealInsightRepository repository;

    public DealInsightService(DealInsightRepository repository) {
        this.repository = repository;
    }

    public List<DealInsight> findAll() { return repository.findAll(); }
    public DealInsight save(DealInsight stat) { return repository.save(stat); }
    public void delete(Long id) { repository.deleteById(id); }
    public Page<DealInsight> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public DealInsight saveOrUpdate(DealInsight stat) {
        Optional<DealInsight> existing = repository.findByStage(stat.getStage());
        if (existing.isPresent()) {
            DealInsight found = existing.get();
            found.setCount(found.getCount() + stat.getCount());
            if (stat.getTotalValue() != null) {
                if (found.getTotalValue() == null) {
                    found.setTotalValue(stat.getTotalValue());
                } else {
                    found.setTotalValue(found.getTotalValue().add(stat.getTotalValue()));
                }
            }
            // Optionally update other fields as needed
            return repository.save(found);
        } else {
            return repository.save(stat);
        }
    }
}