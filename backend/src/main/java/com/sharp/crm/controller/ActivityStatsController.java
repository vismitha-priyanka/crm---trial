package com.sharp.crm.controller;

import com.sharp.crm.model.ActivityStat;
import com.sharp.crm.service.ActivityStatService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/activity-stats")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ActivityStatsController {
    private final ActivityStatService service;

    public ActivityStatsController(ActivityStatService service) {
        this.service = service;
    }

    @GetMapping
    public List<ActivityStat> getAll() {
        return service.findAll();
    }

    @PostMapping
    public ActivityStat save(@RequestBody ActivityStat activityStat) {
        return service.save(activityStat);
    }

    @GetMapping("/paged")
    public Page<ActivityStat> getAllPaged(@PageableDefault(size = 10) Pageable pageable) {
        return service.findAll(pageable);
    }
}