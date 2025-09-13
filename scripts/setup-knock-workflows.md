# 🔔 Knock.app 워크플로우 설정 가이드

## 1. Knock.app 대시보드 설정

### Step 1: Knock.app 로그인
1. https://dashboard.knock.app 접속
2. 제공된 API 키로 프로젝트 확인:
   - Secret Key: `sk_test_qk5dYTaEBPDmMgFU5ZqHoO8GaDi1LXnWhYqWd-sGvm0`
   - Public Key: `pk_test_nSjaYg8KKbjSBV9pIkut8wQbR7FIkM7Djje3ADlrLBY`

### Step 2: 워크플로우 생성

다음 워크플로우들을 생성해야 합니다:

## 워크플로우 1: system-down

**Workflow Key**: `system-down`
**Name**: 시스템 다운 알림
**Description**: 크롤러 시스템이 비활성화되었을 때

**Channels**: Email, In-App Feed, Push Notification

**Email Template**:
```html
<h2>🔴 {{ title }}</h2>
<p>{{ message }}</p>
<p><strong>발생 시간:</strong> {{ timestamp }}</p>
{% if actionUrl %}
<a href="{{ actionUrl }}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">{{ actionLabel | default: "확인하기" }}</a>
{% endif %}
```

**In-App Template**:
```json
{
  "title": "🔴 {{ title }}",
  "body": "{{ message }}",
  "action_url": "{{ actionUrl }}",
  "avatar": "https://day6stream.com/favicon.ico"
}
```

## 워크플로우 2: high-error-rate

**Workflow Key**: `high-error-rate`
**Name**: 높은 에러율 경고
**Description**: 에러율이 임계값을 초과했을 때

**Channels**: In-App Feed, Email

**Email Template**:
```html
<h2>⚠️ {{ title }}</h2>
<p>{{ message }}</p>
{% if errorCount %}
<p><strong>에러 수:</strong> {{ errorCount }}건</p>
{% endif %}
<p><strong>발생 시간:</strong> {{ timestamp }}</p>
{% if actionUrl %}
<a href="{{ actionUrl }}" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">{{ actionLabel | default: "로그 확인" }}</a>
{% endif %}
```

## 워크플로우 3: low-success-rate

**Workflow Key**: `low-success-rate`
**Name**: 낮은 성공률 알림
**Description**: 성공률이 80% 미만일 때

**Channels**: In-App Feed

**In-App Template**:
```json
{
  "title": "📉 {{ title }}",
  "body": "{{ message }} (성공률: {{ successRate }}%)",
  "action_url": "{{ actionUrl }}",
  "avatar": "https://day6stream.com/favicon.ico"
}
```

## 워크플로우 4: api-limit-warning

**Workflow Key**: `api-limit-warning`
**Name**: API 사용량 경고
**Description**: 무료 한도 사용량이 높을 때

**Channels**: In-App Feed

**In-App Template**:
```json
{
  "title": "⚠️ {{ title }}",
  "body": "{{ message }}",
  "action_url": "{{ actionUrl }}",
  "avatar": "https://day6stream.com/favicon.ico"
}
```

## 워크플로우 5: api-limit-critical

**Workflow Key**: `api-limit-critical`
**Name**: API 사용량 임계 경고
**Description**: 무료 한도 임박 시

**Channels**: Email, In-App Feed, Push Notification

**Email Template**:
```html
<h2>🚨 {{ title }}</h2>
<p style="color: #dc2626; font-weight: bold;">{{ message }}</p>
<p><strong>심각도:</strong> 긴급</p>
<p><strong>발생 시간:</strong> {{ timestamp }}</p>
{% if actionUrl %}
<a href="{{ actionUrl }}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">{{ actionLabel | default: "즉시 확인" }}</a>
{% endif %}
```

## 워크플로우 6: crawler-success

**Workflow Key**: `crawler-success`
**Name**: 크롤링 성공 알림
**Description**: 크롤링이 성공적으로 완료되었을 때

**Channels**: In-App Feed

**In-App Template**:
```json
{
  "title": "✅ {{ title }}",
  "body": "{{ message }}",
  "avatar": "https://day6stream.com/favicon.ico"
}
```

## 워크플로우 7: crawler-failed

**Workflow Key**: `crawler-failed`
**Name**: 크롤링 실패 알림
**Description**: 크롤링이 실패했을 때

**Channels**: In-App Feed, Email

**Email Template**:
```html
<h2>❌ {{ title }}</h2>
<p>{{ message }}</p>
{% if platform %}
<p><strong>플랫폼:</strong> {{ platform }}</p>
{% endif %}
<p><strong>발생 시간:</strong> {{ timestamp }}</p>
{% if actionUrl %}
<a href="{{ actionUrl }}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">{{ actionLabel | default: "에러 확인" }}</a>
{% endif %}
```

## 워크플로우 8: crawler-stuck

**Workflow Key**: `crawler-stuck`
**Name**: 크롤러 연속 실패 알림
**Description**: 연속으로 실패가 발생했을 때

**Channels**: Email, In-App Feed, Push Notification

**Email Template**:
```html
<h2>🔄 {{ title }}</h2>
<p style="color: #dc2626; font-weight: bold;">{{ message }}</p>
<p><strong>심각도:</strong> 높음</p>
<p><strong>발생 시간:</strong> {{ timestamp }}</p>
<a href="{{ actionUrl }}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">즉시 확인하기</a>
```

## 워크플로우 9: platform-down

**Workflow Key**: `platform-down`
**Name**: 플랫폼 문제 알림
**Description**: 특정 플랫폼에 문제가 발생했을 때

**Channels**: In-App Feed, Email

**Email Template**:
```html
<h2>🔴 {{ title }}</h2>
<p>{{ message }}</p>
{% if platform %}
<p><strong>문제 플랫폼:</strong> {{ platform | upcase }}</p>
{% endif %}
<p><strong>발생 시간:</strong> {{ timestamp }}</p>
{% if actionUrl %}
<a href="{{ actionUrl }}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">{{ actionLabel | default: "상태 확인" }}</a>
{% endif %}
```

## 워크플로우 10: platform-recovered

**Workflow Key**: `platform-recovered`
**Name**: 플랫폼 복구 알림
**Description**: 문제가 있던 플랫폼이 복구되었을 때

**Channels**: In-App Feed

**In-App Template**:
```json
{
  "title": "✅ {{ title }}",
  "body": "{{ message }}",
  "avatar": "https://day6stream.com/favicon.ico"
}
```

## 2. 알림 피드 설정

### Feed 생성
**Feed ID**: `crawler-alerts`
**Name**: 크롤러 시스템 알림
**Description**: 차트 크롤러 시스템 상태 및 경고 알림

### Feed 설정
```json
{
  "auto_archive_after": "7d",
  "max_items": 100,
  "real_time": true,
  "channels": {
    "in_app_feed": {
      "enabled": true
    },
    "email": {
      "enabled": true
    },
    "push": {
      "enabled": true
    }
  }
}
```

## 3. 사용자 관리

### 관리자 사용자 생성
**User ID**: `admin-user`
**Properties**:
```json
{
  "email": "admin@day6stream.com",
  "name": "관리자",
  "role": "admin",
  "timezone": "Asia/Seoul"
}
```

### 알림 기본 설정
```json
{
  "channel_types": {
    "email": true,
    "in_app_feed": true,
    "push": true,
    "slack": false
  },
  "categories": {
    "system_alerts": true,
    "error_alerts": true,
    "success_notifications": false
  }
}
```

## 4. 테스트 워크플로우

### 테스트 알림 발송
Knock 대시보드에서 각 워크플로우를 테스트:

```json
{
  "recipient": "admin-user",
  "data": {
    "title": "테스트 알림",
    "message": "알림 시스템이 정상 작동 중입니다.",
    "timestamp": "2025-01-15T10:30:00+09:00",
    "severity": "info"
  }
}
```

## 5. API 통합 테스트

### curl로 워크플로우 테스트
```bash
curl -X POST 'https://api.knock.app/v1/workflows/system-down/trigger' \
  -H 'Authorization: Bearer sk_test_qk5dYTaEBPDmMgFU5ZqHoO8GaDi1LXnWhYqWd-sGvm0' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipients": ["admin-user"],
    "data": {
      "title": "🧪 테스트 시스템 다운",
      "message": "이것은 테스트 알림입니다.",
      "timestamp": "2025-01-15T10:30:00+09:00",
      "severity": "critical",
      "actionUrl": "https://day6stream.com/admin/crawler",
      "actionLabel": "시스템 확인"
    }
  }'
```

## 6. 워크플로우 자동화

### Edge Function에서 알림 발송
```typescript
// Supabase Edge Function에서 사용할 코드
const sendKnockNotification = async (workflow: string, data: any) => {
  const response = await fetch(`https://api.knock.app/v1/workflows/${workflow}/trigger`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('KNOCK_SECRET_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: ['admin-user'],
      data
    }),
  });
  
  return response.json();
};

// 크롤링 성공 시
await sendKnockNotification('crawler-success', {
  title: '✅ 크롤링 성공',
  message: `멜론에서 100곡을 성공적으로 수집했습니다.`,
  platform: 'melon',
  timestamp: new Date().toISOString()
});
```

## ✅ 완료 체크리스트

- [ ] 10개 워크플로우 생성 완료
- [ ] 각 워크플로우 템플릿 설정 완료
- [ ] 알림 피드 설정 완료
- [ ] 관리자 사용자 생성 완료
- [ ] 테스트 알림 발송 성공
- [ ] API 통합 테스트 성공

모든 워크플로우가 설정되면 실시간 알림 시스템이 완전히 작동됩니다! 🎉