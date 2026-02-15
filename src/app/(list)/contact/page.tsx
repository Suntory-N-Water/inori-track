export default function Contact() {
  return (
    <div>
      <h1 className='pb-4 font-bold text-2xl text-heading'>お問い合わせ</h1>
      <p className='mb-4'>
        ご質問やご意見がございましたら、以下のGoogleフォームからお問い合わせください。
      </p>
      <div className='w-full max-w-2xl rounded-2xl overflow-hidden shadow-sm'>
        <iframe
          src='https://docs.google.com/forms/d/e/1FAIpQLScIyA0COtOlBMADz6kJxMEZ2QN2MQrwdk6tZOXshbdZuAH13Q/viewform?embedded=true'
          className='w-full h-[80vh]'
          title='お問い合わせフォーム'
        >
          読み込んでいます...
        </iframe>
      </div>
    </div>
  );
}
