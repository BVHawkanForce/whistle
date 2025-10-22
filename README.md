# Whistleblowing Channel

This is a secure and anonymous whistleblowing channel built with Node.js, Express, and PostgreSQL. It is designed to be deployed using Docker.

## Features

-   **Anonymous Reporting:** Users can submit reports without revealing their identity.
-   **Secure Communication:** Encrypted communication channel between the reporter and the case handler.
-   **Multilingual Support:** The application supports English, Swedish, and Finnish.
-   **PDF Export:** Case handlers can export a full report of a case, including all communication, as a PDF.
-   **Secure by Design:** All sensitive data is encrypted in the database.

## Installation

### Prerequisites

-   Docker and Docker Compose

### Running the application

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create a `.env` file:**
    Create a `.env` file in the root of the project and add the following environment variables:
    ```
    DATABASE_URL=postgres://user:password@db:5432/whistleblowing
    ENCRYPTION_KEY=your-very-secret-and-long-encryption-key
    ```
    **Important:** Replace `your-very-secret-and-long-encryption-key` with a strong, randomly generated key.

3.  **Build and run the application with Docker Compose:**
    ```bash
    sudo docker compose up --build -d
    ```

4.  **Initialize the database:**
    ```bash
    sudo docker compose exec -T db psql -U user -d whistleblowing < config/init.sql
    ```

The application will be available at `http://localhost:3000`.

## Managing Translations

The application uses the `i18next` library for internationalization. The language files are located in the `src/locales` directory. Each language has its own subdirectory (e.g., `en`, `sv`, `fi`), which contains a `translation.json` file.

To add a new language:

1.  Create a new directory for the language in `src/locales`.
2.  Copy the `translation.json` file from an existing language directory to the new directory.
3.  Translate the values in the new `translation.json` file.
4.  Add the new language to the `preload` array in `src/index.js`.

To add a new translation key:

1.  Add the key and its value to each of the `translation.json` files.
2.  Use the key in your EJS templates with the `t()` function (e.g., `<%= t('new_key') %>`).
