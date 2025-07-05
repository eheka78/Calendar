package NotModified.Calendar.controller;

import NotModified.Calendar.dto.event.EventCreateRequest;
import NotModified.Calendar.dto.event.EventResponse;
import NotModified.Calendar.dto.event.EventUpdateRequest;
import NotModified.Calendar.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.parser.Entity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
public class CalendarApiController {

    private final EventService eventService;

    // 일정 등록 (@RequestBody 누락)
    @PostMapping("/calendar")
    public ResponseEntity<?> createEvent(@RequestBody EventCreateRequest request) {
        eventService.registerEvent(request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "일정 등록 성공"
            )
        );
    }
    
    // 특정 년, 월에 해당하는 모든 일정 조회
    @GetMapping("/calendar/{userId}")
    public List<EventResponse> getEventsByYearAndMonth(@PathVariable("userId") String userId,
                                                          @RequestParam("year") Long year,
                                                          @RequestParam("month") Long month) {
        return eventService.findByYearAndMonth(userId, year, month);
    }

    // 특정 날짜의 일정 조회
    @GetMapping("/calendar/event/{userId}")
    public List<EventResponse> getOneEvent(@PathVariable("userId") String userId,
                                              @RequestParam("date") LocalDate date) {
        return eventService.findByDate(userId, date);
    }

    @PutMapping("/calendar/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable("id") Long id,
                                         @RequestBody Map<String, Object> updates) {
        eventService.updateEventById(id, updates);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "일정 업데이트 성공."
        ));
    }

    // 일정 삭제
    @DeleteMapping("/calendar/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable("id") Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "일정 삭제 성공"
        ));
    }
}
