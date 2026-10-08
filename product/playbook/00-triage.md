# 00 — Triage: you just got rejected

Read this first. It takes five minutes and stops you wasting a week.

## Step 1 — Do not argue yet

Your first instinct will be to reply to App Review explaining why they are wrong. Resist it. In roughly nine cases out of ten the reviewer saw a real problem, and an argument costs you a full cycle (Apple 24–48h, Google 2–7 days) while a fix costs you an afternoon.

Reply-with-a-fix always beats reply-with-an-argument.

## Step 2 — Extract the three facts

Open the rejection and write down, literally:

- **The guideline number.** `4.2`, `2.5.2`, `2.1`, `5.1.1`, `5.1.2`, `3.1.1`, `4.3`, `2.3.x`, `4.8`, `ITMS-91053`. Google usually has no number — it names a policy instead ("Invalid Data safety form", "Limited functionality", "Account deletion").
- **What the reviewer did.** "We were unable to sign in", "the app displayed a blank screen", "we tapped X and nothing happened". This is the single most valuable sentence in the email.
- **What they expected.** Usually the last paragraph. Sometimes it is missing entirely, which is when you ask one precise question (Step 5).

If there is no guideline number, search the exact sentence in the Apple Developer Forums or the Google Play community. Other developers post the same wording, and the threads say what worked.

## Step 3 — Match it to the playbook

| Guideline / policy | File |
|---|---|
| Apple 4.2 Minimum Functionality | `01-apple-4.2.md` |
| Apple 2.5.2 remote code execution | `02-apple-2.5.2.md` |
| Apple 2.1 demo account, crash, incomplete | `03-apple-2.1.md` |
| Apple 5.1.1 data collection, purpose strings | `04-apple-5.1.1.md` |
| Apple 5.1.2 account deletion | `05-apple-5.1.2.md` |
| Apple 3.1.1 payments / IAP | `06-apple-3.1.1.md` |
| Apple ITMS-91053 privacy manifest | `08-apple-privacy-manifest.md` |
| Apple 4.3 spam / duplicate | `09-apple-4.3.md` |
| Apple 2.3.x metadata & screenshots | `10-apple-2.3.md` |
| Apple 1.2 user-generated content | `11-apple-1.2.md` |
| Apple 4.0/4.1 design, layout, non-native | `12-apple-4.0-design.md` |
| Encryption / export compliance | `13-apple-encryption.md` |
| Push entitlements & provisioning | `14-apple-push.md` |
| Apple 4.8 Sign in with Apple | `25-apple-sign-in.md` |
| Login loop / cookies in WebView | `26-webview-auth.md` |
| Google 12 testers / 14 days | `15-google-12-testers.md` |
| Google Data safety form | `16-google-data-safety.md` |
| Google account deletion | `17-google-account-deletion.md` |
| Google target API level | `18-google-target-api.md` |
| Google limited functionality | `19-google-limited-functionality.md` |
| Google test instructions / demo | `20-google-test-instructions.md` |
| Google ads & families policy | `21-google-ads.md` |
| Google metadata violations | `22-google-metadata.md` |
| Signing, keystore, AAB | `23-google-signing.md` |
| Repeated rejections, how to reply | `24-reply-templates.md` |

Or skip the table: paste your rejection text into the free decoder and it will match and generate the AI prompt for you.

## Step 4 — Apply the minimum fix, not the maximum

There is a trap here. You read the playbook, see eleven things wrong with your app, and decide to rebuild half of it. Now you are three weeks late and the reviewer has a fresh build with fresh problems.

**Fix what they named. Nothing more.** Then submit. Improvements go in the next release, which will be reviewed much faster because you now have an approval history.

The only exception: if the playbook entry tells you a second blocker is *certain* to trigger on the next review (e.g. you fix 4.2 but still have no account deletion, which is 5.1.2), fix both now. Certain blockers are worth batching. Probable-but-uncertain ones are not.

## Step 5 — When the rejection is genuinely vague

Sometimes you get two sentences and no guideline. Then, and only then, reply with **one precise question**:

> Thank you for the review. We want to fix this correctly on the first attempt. Could you confirm which specific screen or flow did not behave as expected? We have tested the flow described on iPhone 15 Pro / iOS 18 and cannot reproduce it. A demo account and a screen recording of the full flow are attached to App Review Information.

One question. Never three. Never "we disagree because…". Attach the demo credentials and the video in the same message so the next reviewer has everything and the cycle shortens.

## Step 6 — Log it

Add a row to `rejection-log.csv` (template in `playbook/99-runbook.md`):

`date | store | guideline | reviewer said | root cause | fix shipped | days lost`

After three rows you will see your own systematic weakness. Almost always it is one of: no demo data, no native capability, or a metadata claim the app does not back up. Fixing the pattern is worth more than fixing the instance.

---

## Budget honestly

First submission of an AI-built app: **plan for 3 review cycles.** Apple 24–48h each, Google 2–7 days each, plus your own fix time. Realistically 2–4 weeks from "finished" to "live".

Anyone selling you guaranteed first-try approval is selling you something. What you can do is make cycle one your only cycle by running the pre-submission audit in `99-runbook.md` — that is what this Kit is for.

---

## RU — Коротко

1. **Не спорьте.** Сначала исправьте, потом отвечайте. Спор стоит полного круга ревью (Apple 24–48 ч, Google 2–7 дней), исправление стоит одного вечера.
2. **Выпишите три факта:** номер пункта правил, что сделал ревьюер, чего он ожидал. Самое ценное предложение в письме — второе.
3. **Найдите файл в плейбуке** по таблице выше или вставьте текст отказа в бесплатный декодер.
4. **Чините минимально**, только то, что назвали. Перестройка половины приложения = три недели опоздания и новые проблемы для ревьюера. Исключение: если следующий блокер *гарантирован* (например, починили 4.2, но нет удаления аккаунта — это 5.1.2), чините оба сразу.
5. **Если отказ реально размытый** — задайте один точный вопрос, приложив демо-доступы и видео. Не три вопроса и не «мы не согласны».
6. **Ведите лог отказов.** После трёх строк видна ваша системная слабость. Чинить паттерн полезнее, чем чинить случай.
7. **Закладывайте 3 круга ревью** на первую отправку. Реально: 2–4 недели от «готово» до «в сторе».
