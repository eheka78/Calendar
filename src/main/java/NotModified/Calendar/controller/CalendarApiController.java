package NotModified.Calendar.controller;

import NotModified.Calendar.dto.event.EventCreateRequest;
import NotModified.Calendar.dto.event.EventResponse;
import NotModified.Calendar.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CalendarApiController {

    private final EventService eventService;

    // 일정 등록 (@RequestBody 누락)
    @PostMapping("/calendar")
    public ResponseEntity<?> createSchedule(@RequestBody EventCreateRequest request) {
        eventService.registerEvent(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "일정 등록 성공"
            )
        );
    }
    
    // 특정 년, 월에 해당하는 모든 일정 조회
    @GetMapping("/calendar/{userId}")
    public List<EventResponse> getSchedulesByYearAndMonth(@PathVariable("userId") String userId,
                                                          @RequestParam("year") Long year,
                                                          @RequestParam("month") Long month) {
        return eventService.findByYearAndMonth(userId, year, month);
    }

    // 특정 날짜의 일정 조회
    @GetMapping("calendar/event/{userId}")
    public List<EventResponse> getOneSchedule(@PathVariable("userId") String userId,
                                              @RequestParam("date") LocalDate date) {
        return eventService.findByDate(userId, date);
    }
}
