package NotModified.Calendar.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicInsert // null 값은 무시하고 default 값으로 넣어줌
@Table(name = "event")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;
    @Column(name = "title")
    private String title;
    @Column(name = "color")
    private String color;
    @Column(name = "memo")
    private String memo;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "start_time")
    private LocalTime startTime;
    @Column(name = "end_date")
    private LocalDate endDate;
    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "repeat")
    private String repeat;
    @Column(name = "repeat_end_date")
    private LocalDate repeatEndDate;
    @Column(name = "repeat_end_time")
    private LocalTime repeatEndTime;
}
