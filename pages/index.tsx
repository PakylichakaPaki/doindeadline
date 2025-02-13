import Head from 'next/head';
import Form from '../components/Form';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Форма создания задачи</title>
        <meta name="description" content="Создание задачи через форму" />
      </Head>
      <main className="flex justify-center items-center min-h-screen bg-gray-100">
        <Form />
      </main>
    </div>
  );
}