CREATE TABLE schedule (
    id bigint AUTO_INCREMENT PRIMARY KEY,
    user_id varchar(50) NOT NULL,
    title varchar(255) default '내 일정',
    color varchar(10) default '#FFFFFF',
    start_date DATETIME,
    end_date DATETIME,
    memo varchar(255)
);

CREATE TABLE repeat (
    id bigint AUTO_INCREMENT PRIMARY KEY,
    schedule_id bigint,
    cycle varchar(10) default 'weekly',
    start_date DATETIME,
    end_date DATETIME,
    FOREIGN KEY(schedule_id) references schedule(id) ON DELETE CASCADE
);

// 종료일 미입력 시 start_date + 5년 뒤로 자동 설정 로직 추가