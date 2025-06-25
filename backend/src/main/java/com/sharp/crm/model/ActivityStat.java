package com.sharp.crm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activity_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String day;
    private int calls;
    private int emails;
    private int meetings;
}