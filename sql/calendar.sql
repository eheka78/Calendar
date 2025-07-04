/* CREATE TABLE event (
    id bigint AUTO_INCREMENT PRIMARY KEY,
    user_id varchar(50) NOT NULL,
    title varchar(255) default '내 일정',
    color varchar(10) default '#0000FF',
    memo varchar(255),
    start_date_time DATETIME not null,
    end_date_time DATETIME,
    repeat varchar(10) default 'none',
    repeat_end_date_time DATETIME
); */

CREATE TABLE event (
    id bigint AUTO_INCREMENT PRIMARY KEY,
    user_id varchar(50) NOT NULL,
    title varchar(255) default '내 일정',
    color varchar(10) default '#0000FF',
    memo varchar(255),
    start_date DATE not null,
    start_time TIME,
    end_date DATE,
    end_time TIME,
    repeat varchar(10) default 'none',
    repeat_end_date DATE,
    repeat_end_time TIME
);

// none인 경우, 반복 x, none이 아닌 경우 반복 o ->
// 보통 PK, FK의 이름은 동일하게
// 1. 시작 날짜 : single-day-event, 시간 없음 (하루 종일)
// 2. 시작 날짜, 시작 시간 : single-day-event, 시간 존재
// 3. 시작 날짜, 종료 날짜 : multi-day-event, 시간 없음
// 4. 시작 날짜, 시작 시간, 종료 날짜, 종료 시간 : multi-day-event, 시간 존재
// end_date_time < start_date_time 이면 x
