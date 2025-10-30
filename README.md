# Desmond & Sophie - Wedding RSVP

This is the official wedding website for Desmond & Sophie, featuring a custom-built RSVP and guest management system. The project is built with Next.js, Prisma, and MySQL, and includes a secure invite system and an admin dashboard for the couple to manage their guest list.

## ✨ Features

- **Custom Invite Links**: Secure, unique invite links for each guest (`/invite/[name]?code=XXXX`).
- **RSVP System**: Guests can RSVP with their attendance status (Yes, No, Maybe) and number of attendees.
- **Nigerian Phone Validation**: Collects and validates Nigerian phone numbers for SMS notifications.
- **SMS Notifications**: Sends confirmation SMS messages upon RSVP (pluggable adapter).
- **Admin Dashboard**: A password-protected dashboard for the couple to:
  - View a real-time guest list and attendance summary.
  - Track expected attendees with smart "maybe" calculations.
  - Create new guests and auto-generate invite codes.
  - Copy invite links and manage guest details.
- **Print-Friendly Summary**: Easily print the attendance summary for planning.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Local Development**: [Docker](https://www.docker.com/) & [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/stbensonimoh/desmondxsophie.git
cd desmondxsophie
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Copy the example `.env` file and update the values:

```bash
cp .env.example .env
```

Update the following in your `.env` file:

- `DATABASE_URL`: Should match your local MySQL setup.
- `INVITE_TOKEN_SECRET`: A long, random string for signing tokens.
- `INVITE_ADMIN_PASSWORD`: A strong password for the admin dashboard.
- `SMS_API_URL` & `SMS_API_KEY`: Your SMS provider's credentials (optional).

### 4. Start the Database

Run the local MySQL database using Docker Compose:

```bash
bun run db:up
```

### 5. Apply Database Migrations

Apply the Prisma schema to your local database:

```bash
bunx prisma migrate dev
```

### 6. Seed the Database

Seed the database with some sample guests and invite codes:

```bash
bun run seed
```

This will print sample invite links to your terminal.

### 7. Run the Development Server

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🔐 Admin Access

- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Password**: The value of `INVITE_ADMIN_PASSWORD` in your `.env` file.

## 📜 Available Scripts

- `bun run dev`: Starts the Next.js development server.
- `bun run build`: Builds the application for production.
- `bun run start`: Starts a production server.
- `bun run db:up`: Starts the local MySQL container.
- `bun run db:down`: Stops the local MySQL container.
- `bun run db:logs`: Tails the database logs.
- `bun run prisma:migrate`: Applies database migrations.
- `bun run seed`: Seeds the database with sample data.

## 🗃️ Database Schema

The Prisma schema includes the following models:

- `Guest`: Stores guest information (name, contact details).
- `InviteCode`: Manages unique invite codes, max attendees, and usage status.
- `RsvpResponse`: Records each guest's RSVP response.
- `OutboxEvent`: A transactional outbox for handling asynchronous events like SMS notifications.

For more details, see `prisma/schema.prisma`.

## 🔮 Future Enhancements

- **CSV Export**: Implement the "Export to CSV" functionality for the guest list.
- **Email Notifications**: Add email notifications for RSVPs and reminders.
- **Advanced Filtering**: Add more advanced filtering and search to the admin dashboard.

---

_This project was built with ❤️ for Desmond & Sophie._
