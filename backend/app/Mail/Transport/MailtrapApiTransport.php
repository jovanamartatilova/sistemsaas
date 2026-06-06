<?php
namespace App\Mail\Transport;

use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;

class MailtrapApiTransport extends AbstractTransport
{
    private string $apiToken;

    public function __construct(string $apiToken)
    {
        $this->apiToken = $apiToken;
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $payload = [
            'from' => [
                'email' => $email->getFrom()[0]->getAddress(),
                'name'  => $email->getFrom()[0]->getName() ?? '',
            ],
            'to' => array_map(
                fn($a) => ['email' => $a->getAddress(), 'name' => $a->getName() ?? ''],
                $email->getTo()
            ),
            'subject' => $email->getSubject(),
        ];

        if ($email->getHtmlBody()) $payload['html'] = $email->getHtmlBody();
        if ($email->getTextBody()) $payload['text'] = $email->getTextBody();

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiToken,
            'Content-Type'  => 'application/json',
        ])->post('https://send.api.mailtrap.io/api/send', $payload);

        if ($response->failed()) {
            throw new \Exception("Mailtrap API error ({$response->status()}): {$response->body()}");
        }
    }

    public function __toString(): string
    {
        return 'mailtrap+api://default';
    }
}
