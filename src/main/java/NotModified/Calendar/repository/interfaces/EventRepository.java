package NotModified.Calendar.repository.interfaces;

import NotModified.Calendar.domain.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("select e from Event e " +
            "where e.userId = :userId " +
            "and e.repeat <> 'none'")
    List<Event> findRepeatEvents(@Param("userId") String userId);

    // 단일 일정 중에서 특정 날짜를 포함하는 일정
    // targetDate가 시작일~종료일 범위 내에 포함되어 있으면 그 일정은 targetDate에 해당
    @Query("select e from Event e " +
            "where e.userId = :userId " +
            "and e.repeat = 'none' " +
            "and e.startDate <= :targetDate " +
            "and e.endDate >= :targetDate")
    List<Event> findSingleEventsByDate(@Param("userId") String userId,
                                       @Param("targetDate") LocalDate targetDate);

    // 단일 일정(반복 x) 중에서 특정 년, 월에 포함되는 일정들
    @Query("select e from Event e " +
            "where e.userId = :userId " +
            "and e.repeat = 'none' " +
            "and function('year', e.startDate) = :year " +
            "and function('month', e.startDate) = :month")
    List<Event> findSingleEventsByYearAndMonth(@Param("userId") String userId,
                                               @Param("year") Long year,
                                               @Param("month") Long month);
}
