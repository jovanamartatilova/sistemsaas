<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

class MailtrapApiTransport extends AbstractTransport
{
    private string $apiToken;

    public function __construct(
        string $apiToken,
        HttpClientInterface $client = null,
        LoggerInterface $logger = null
    ) {
        $this->apiToken = $apiToken;
        parent::__construct($client, $logger);
    }

    protected function doSend(Email $message): string
    {
        $payload = [
            'from' => [
                'address' => $message->getFrom()[0]->getAddress(),
                'name' => $message->getFrom()[0]->getName() ?? '',
            ],
            'to' => array_map(
                fn($address) => [
                    'address' => $address->getAddress(),
                    'name' => $address->getName() ?? '',
                ],
                $message->getTo()
            ),
            'subject' => $message->getSubject(),
        ];

        if ($message->getHtmlBody()) {
            $payload['html'] = $message->getHtmlBody();
        }

        if ($message->getTextBody()) {
            $payload['text'] = $message->getTextBody();
        }

        if ($message->getCc()) {
            $payload['cc'] = array_map(
                fn($address) => [
                    'address' => $address->getAddress(),
                    'name' => $address->getName() ?? '',
                ],
                $message->getCc()
            );
        }

        if ($message->getBcc()) {
            $payload['bcc'] = array_map(
                fn($address) => [
                    'address' => $address->getAddress(),
                    'name' => $address->getName() ?? '',
                ],
                $message->getBcc()
            );
        }

        if ($message->getReplyTo()) {
            $payload['reply_to'] = array_map(
                fn($address) => [
                    'address' => $address->getAddress(),
                    'name' => $address->getName() ?? '',
                ],
                $message->getReplyTo()
            );
        }

        try {
            $response = $this->client->request('POST', 'https://send.api.mailtrap.io/api/send', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $statusCode = $response->getStatusCode();
            
            if ($statusCode !== 200) {
                $content = $response->getContent(false);
                throw new \Exception(
                    "Mailtrap API error (HTTP {$statusCode}): {$content}"
                );
            }

            return $response->getContent();
        } catch (\Exception $e) {
            throw new \Exception("Failed to send email via Mailtrap API: " . $e->getMessage(), 0, $e);
        }
    }

    public function __toString(): string
    {
        return 'mailtrap+api://default';
    }
}
