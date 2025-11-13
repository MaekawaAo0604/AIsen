# バックグラウンド通知のテスト方法

IndexedDBベースのバックグラウンド通知が実装されました。以下の手順でテストできます。

## 準備

1. **開発サーバー起動**
```bash
npm run dev
```

2. **ブラウザでアクセス**
- Chrome または Edge を使用（Periodic Background Sync対応）
- `http://localhost:3000` を開く

3. **通知を有効化**
- サイドバーから「通知設定」をクリック
- 「プッシュ通知」をONにする
- ブラウザの通知権限を「許可」する

## テスト1: フォアグラウンド通知（ブラウザ開いてる時）

### 1分後に通知が来るようにテスト

1. タスクを作成
   - 任意の象限にタスク追加
   - タイトル: "テストタスク"
   - 期限: **現在時刻の2分後**（例: 15:00なら15:02に設定）

2. 通知設定で確認
   - 「1時間前に通知」にチェック
   - 「スケジュール確認」ボタンをクリック
   - コンソールに通知スケジュールが表示される

3. 1分待つ
   - コンソールに「🔔 Executing scheduled notification: deadline-1hour」が表示
   - デスクトップに「⏰ 期限まであと1時間」通知が表示される

### 定時通知のテスト

1. 通知設定画面で「毎日のタスク一覧」をON
2. 通知時刻を**現在時刻の1分後**に設定（例: 15:00なら15:01）
3. 「スケジュール確認」ボタンで登録確認
4. 1分待つ → 「☀️ 今日のタスク」通知が表示

## テスト2: バックグラウンド通知（ブラウザ閉じた時）

### 重要な注意点

- **対応ブラウザ**: Chrome/Edge のみ
- **Safari/Firefox**: Periodic Background Sync 非対応のため動作しない
- **実行間隔**: 最短1時間（ブラウザが自動調整、正確ではない）

### テスト手順

#### 方法A: 手動トリガー（すぐテストできる）

1. タスクを作成し、期限を**現在時刻の1分後**に設定
2. 通知設定で「1時間前に通知」にチェック
3. 「スケジュール確認」で登録を確認
4. **全てのブラウザタブを閉じる**
5. Chrome DevTools のService Worker パネルを開く:
   - `chrome://serviceworker-internals/`
   - または Application タブ → Service Workers
6. 「periodicsync」イベントを手動トリガー
7. 通知が表示される

#### 方法B: 実際の定期実行（時間がかかる）

1. 上記と同じようにタスクと通知を設定
2. **全てのブラウザタブを閉じる**
3. **1時間以上待つ**
4. ブラウザが自動的にService Workerを起動
5. 通知が表示される（正確な時間は保証されない）

## デバッグ方法

### IndexedDBの中身を確認

1. Chrome DevTools を開く（F12）
2. **Application** タブ → **Storage** → **IndexedDB**
3. `aisen_db` → `scheduled_notifications` を選択
4. 登録されている通知スケジュールが一覧表示される

各通知レコードの構造:
```json
{
  "id": "task-id-1hour",
  "taskId": "task-id",
  "type": "deadline-1hour",
  "scheduledTime": 1234567890000,
  "payload": {
    "title": "⏰ 期限まであと1時間",
    "body": "テストタスク"
  }
}
```

### Service Workerのログを確認

1. Chrome DevTools → **Console**
2. フィルターで `[SW]` を検索
3. Service Workerからのログが表示される:
   - `[SW] Checking scheduled notifications...`
   - `[SW] Found X overdue notifications`
   - `[SW] 🔔 Executing notification: deadline-1hour`
   - `[SW] ✅ Executed X notifications`

### Periodic Background Syncの状態確認

1. `chrome://serviceworker-internals/` を開く
2. 自分のService Workerを探す
3. 「Periodic Background Sync」セクションで以下を確認:
   - Tag: `check-notifications`
   - Interval: `3600000` (1時間)
   - State: `registered`

## トラブルシューティング

### 通知が来ない場合

1. **通知権限を確認**
   - ブラウザの通知設定で許可されているか
   - macOS: システム環境設定 → 通知 → Chrome

2. **Service Worker登録を確認**
   - DevTools → Application → Service Workers
   - 「Status: activated and is running」になっているか

3. **IndexedDBにデータがあるか確認**
   - Application → IndexedDB → aisen_db
   - scheduled_notifications に通知が登録されているか

4. **scheduledTime が未来の時刻か確認**
   - 現在時刻のUnixタイムスタンプと比較
   - `Date.now()` で現在時刻を確認

5. **コンソールエラーを確認**
   - Service Worker関連のエラーがないか
   - IndexedDB関連のエラーがないか

### バックグラウンドで動かない場合

1. **Chromium系ブラウザを使用しているか**
   - Chrome/Edge のみ対応
   - Safari/Firefoxは非対応

2. **Periodic Background Sync が有効か**
   - `chrome://flags` で無効化されていないか確認

3. **バッテリーセーバーモードではないか**
   - バッテリーセーバーモード時は実行頻度が制限される

4. **実際に1時間以上待ったか**
   - ブラウザが自動調整するため、正確ではない
   - 手動トリガーでテストすることを推奨

## 動作フローの詳細

### フォアグラウンド（ブラウザ開いてる時）

```
1分ごと → checkAndExecuteScheduledNotifications()
         → IndexedDB から scheduledTime <= now の通知取得
         → showLocalNotification() で表示
         → IndexedDB から実行済み通知削除
```

### バックグラウンド（ブラウザ閉じた時）

```
ブラウザ閉じる → Periodic Background Sync が1時間ごとに起動
              → Service Worker が起動
              → checkScheduledNotifications() 実行
              → IndexedDB から scheduledTime <= now の通知取得
              → self.registration.showNotification() で表示
              → IndexedDB から実行済み通知削除
```

## 本番環境での注意点

1. **Periodic Background Sync の制約**
   - 最小間隔: 1時間（現在の設定）
   - ブラウザが自動調整するため、正確ではない
   - バッテリーセーバー時は実行されない可能性

2. **正確な通知が必要な場合**
   - Firebase Cloud Messaging 等の外部サービス推奨
   - サーバー側でスケジュール管理
   - Web Push APIでプッシュ送信

3. **IndexedDB のクオータ**
   - ブラウザごとに容量制限あり
   - 古いスケジュールは定期的に削除推奨
