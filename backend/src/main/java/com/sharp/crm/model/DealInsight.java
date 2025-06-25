package com.sharp.crm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "deal_insights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealInsight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stage;
    private int count;

    @Column(name = "total_value")
    private java.math.BigDecimal totalValue;
}