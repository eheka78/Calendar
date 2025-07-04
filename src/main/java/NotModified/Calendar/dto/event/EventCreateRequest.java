package NotModified.Calendar.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCreateRequest {
    private String userId;
    private String title;
    private String color;
    private String memo;

    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;

    private String repeat;
    private LocalDate repeatEndDate;
    private LocalTime repeatEndTime;
}
