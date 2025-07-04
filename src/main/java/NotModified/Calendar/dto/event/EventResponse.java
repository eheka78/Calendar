package NotModified.Calendar.dto.event;

import NotModified.Calendar.domain.Event;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@NoArgsConstructor
public class EventResponse {
    private String title;
    private String color;
    private String memo;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    private String repeat;
    private LocalDateTime repeatEndDateTime;

    public static EventResponse from(Event e) {
        return new EventResponse(
                e.getTitle(),
                e.getColor(),
                e.getMemo(),
                LocalDateTime.of(e.getStartDate(), e.getStartTime()),
                LocalDateTime.of(e.getEndDate(), e.getEndTime()),
                e.getRepeat(),
                e.getRepeatEndDate() != null && e.getRepeatEndTime() != null
                        ? LocalDateTime.of(e.getRepeatEndDate(), e.getRepeatEndTime())
                        : null
        );
    }

    public EventResponse(String title, String color, String memo,
                         LocalDateTime startDateTime, LocalDateTime endDateTime,
                         String repeat, LocalDateTime repeatEndDateTime) {
        this.title = title;
        this.color = color;
        this.memo = memo;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.repeat = repeat;
        this.repeatEndDateTime = repeatEndDateTime;
    }

}