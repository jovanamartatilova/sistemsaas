<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=UTF-8" http-equiv="content-type">
@php
    $logo_y = isset($layout_settings['logo_y']) ? (int) $layout_settings['logo_y'] : 0;
    $logo_x = isset($layout_settings['logo_x']) ? (int) $layout_settings['logo_x'] : 0;
    $show_logo = isset($layout_settings['show_logo']) ? filter_var($layout_settings['show_logo'], FILTER_VALIDATE_BOOLEAN) : true;

    $title_y = isset($layout_settings['title_y']) ? (int) $layout_settings['title_y'] : 0;
    $title_x = isset($layout_settings['title_x']) ? (int) $layout_settings['title_x'] : 0;
    $show_title = isset($layout_settings['show_title']) ? filter_var($layout_settings['show_title'], FILTER_VALIDATE_BOOLEAN) : true;

    $recipient_y = isset($layout_settings['recipient_y']) ? (int) $layout_settings['recipient_y'] : 0;
    $recipient_x = isset($layout_settings['recipient_x']) ? (int) $layout_settings['recipient_x'] : 0;
    $show_recipient = isset($layout_settings['show_recipient']) ? filter_var($layout_settings['show_recipient'], FILTER_VALIDATE_BOOLEAN) : true;

    $body_y = isset($layout_settings['body_y']) ? (int) $layout_settings['body_y'] : 0;
    $body_x = isset($layout_settings['body_x']) ? (int) $layout_settings['body_x'] : 0;
    $show_body = isset($layout_settings['show_body']) ? filter_var($layout_settings['show_body'], FILTER_VALIDATE_BOOLEAN) : true;

    $signature_y = isset($layout_settings['signature_y']) ? (int) $layout_settings['signature_y'] : 0;
    $signature_x = isset($layout_settings['signature_x']) ? (int) $layout_settings['signature_x'] : 0;
    $show_signatures = isset($layout_settings['show_signatures']) ? filter_var($layout_settings['show_signatures'], FILTER_VALIDATE_BOOLEAN) : true;

    $qr_y = isset($layout_settings['qr_y']) ? (int) $layout_settings['qr_y'] : 0;
    $qr_x = isset($layout_settings['qr_x']) ? (int) $layout_settings['qr_x'] : 0;

    $font_size_title = isset($layout_settings['font_size_title']) ? (int) $layout_settings['font_size_title'] : null;
    $font_size_name = isset($layout_settings['font_size_name']) ? (int) $layout_settings['font_size_name'] : null;
    $font_size_body = isset($layout_settings['font_size_body']) ? (int) $layout_settings['font_size_body'] : null;

    // Custom font colors (empty string = use theme default)
    $font_color_title = isset($layout_settings['font_color_title']) && $layout_settings['font_color_title'] ? $layout_settings['font_color_title'] : null;
    $font_color_cert_id = isset($layout_settings['font_color_cert_id']) && $layout_settings['font_color_cert_id'] ? $layout_settings['font_color_cert_id'] : null;
    $font_color_name = isset($layout_settings['font_color_name']) && $layout_settings['font_color_name'] ? $layout_settings['font_color_name'] : null;
    $font_color_labels = isset($layout_settings['font_color_labels']) && $layout_settings['font_color_labels'] ? $layout_settings['font_color_labels'] : null;
    $font_color_role = isset($layout_settings['font_color_role']) && $layout_settings['font_color_role'] ? $layout_settings['font_color_role'] : null;
    $font_color_body = isset($layout_settings['font_color_body']) && $layout_settings['font_color_body'] ? $layout_settings['font_color_body'] : null;
    $font_color_signatures = isset($layout_settings['font_color_signatures']) && $layout_settings['font_color_signatures'] ? $layout_settings['font_color_signatures'] : null;

    // Signature image inversion: if sig_invert_1/2 is true, invert the base64 image using PHP GD
    $sig_invert_1 = !empty($layout_settings['sig_invert_1']);
    $sig_invert_2 = !empty($layout_settings['sig_invert_2']);

    if ($sig_invert_1 && isset($signature_base64) && $signature_base64 && function_exists('imagecreatefromstring') && function_exists('imagefilter') && function_exists('imagepng')) {
        try {
            $imgData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $signature_base64));
            $src = @imagecreatefromstring($imgData);
            if ($src) {
                imagefilter($src, IMG_FILTER_NEGATE);
                ob_start();
                imagepng($src);
                $signature_base64 = 'data:image/png;base64,' . base64_encode(ob_get_clean());
                imagedestroy($src);
            }
        } catch (\Throwable $e) { /* keep original */
        }
    }
    if ($sig_invert_2 && isset($signature2_base64) && $signature2_base64 && function_exists('imagecreatefromstring') && function_exists('imagefilter') && function_exists('imagepng')) {
        try {
            $imgData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $signature2_base64));
            $src = @imagecreatefromstring($imgData);
            if ($src) {
                imagefilter($src, IMG_FILTER_NEGATE);
                ob_start();
                imagepng($src);
                $signature2_base64 = 'data:image/png;base64,' . base64_encode(ob_get_clean());
                imagedestroy($src);
            }
        } catch (\Throwable $e) { /* keep original */
        }
    }

    $compCount = count($competencies);
    if ($compCount <= 4) {
        $fontSize = '9.5pt';
        $descFontSize = '8.5pt';
        $cellPadding = '6pt 10pt';
        $sigMargin = '25pt';
        $evalMargin = '15pt';
    } elseif ($compCount <= 7) {
        $fontSize = '8.5pt';
        $descFontSize = '7.5pt';
        $cellPadding = '4pt 7pt';
        $sigMargin = '15pt';
        $evalMargin = '10pt';
    } else {
        $fontSize = '7.5pt';
        $descFontSize = '6.5pt';
        $cellPadding = '2pt 5pt';
        $sigMargin = '8pt';
        $evalMargin = '5pt';
    }
@endphp
<style type="text/css">
    @if($background_base64)
        @page { 
            size: A4 landscape;
            margin: 0;
        }
    @else
        @page { 
            size: A4 landscape;
            margin: 30px;
        }
    @endif
    
    body {
        margin: 0 !important;
        padding: 40px 60px !important;
    }

    /* Template Themes */
    @if($template_style === 'modern')
        body {
            font-family: "Helvetica", Arial, sans-serif;
            color: #1e293b;
        }
        .main-border { border: 4px solid #1e293b; }
        .inner-border { border: 1px solid #cbd5e1; }
        .cert-title {
            font-size: {{ $font_size_title ?? 28 }}pt;
            letter-spacing: 4px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 10px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .candidate-name {
            font-size: {{ $font_size_name ?? 32 }}pt;
            font-family: "Helvetica", sans-serif;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 15px;
            text-transform: capitalize;
        }
        .internship-type {
            background-color: #6366f1;
            color: #fff;
            padding: 6px 20px;
            border-radius: 4px;
            font-size: 12pt;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 25px;
        }
    @elseif($template_style === 'elegant')
        body {
            font-family: "Georgia", serif;
            color: #2c2520;
        }
        .main-border { border: 4px double #d4af37; }
        .inner-border { border: 1px solid #fef08a; }
        .cert-title {
            font-size: {{ $font_size_title ?? 26 }}pt;
            letter-spacing: 8px;
            font-weight: 400;
            color: #854d0e;
            margin-top: 10px;
            margin-bottom: 15px;
            text-transform: uppercase;
            font-style: italic;
        }
        .candidate-name {
            font-size: {{ $font_size_name ?? 34 }}pt;
            font-family: "Georgia", serif;
            font-style: italic;
            color: #854d0e;
            margin-bottom: 15px;
            text-transform: capitalize;
        }
        .internship-type {
            background-color: #854d0e;
            color: #fff;
            padding: 6px 20px;
            border-radius: 30px;
            font-size: 11pt;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 25px;
        }
    @else
        /* Classic - current default */
        body {
            font-family: "Arial", sans-serif;
            color: #1e293b;
        }
        .main-border { border: 3px solid #3b82f6; }
        .inner-border { border: 1px solid #93c5fd; }
        .cert-title {
            font-size: {{ $font_size_title ?? 30 }}pt;
            letter-spacing: 6px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 10px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .candidate-name {
            font-size: {{ $font_size_name ?? 34 }}pt;
            font-family: "Times New Roman", serif;
            font-style: italic;
            color: #0f172a;
            margin-bottom: 15px;
            text-transform: capitalize;
        }
        .internship-type {
            background-color: #2563eb;
            color: #fff;
            padding: 6px 20px;
            border-radius: 20px;
            font-size: 12pt;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 25px;
        }
    @endif

    .main-border {
        position: fixed;
        top: 0px; left: 0px; right: 0px; bottom: 0px;
        z-index: -1;
    }
    .inner-border {
        position: fixed;
        top: 10px; left: 10px; right: 10px; bottom: 10px;
        z-index: -1;
    }

    .page-1 {
        page-break-after: always;
        position: relative;
        height: 640px;
        text-align: center;
    }

    .page-2 {
        position: relative;
        height: 640px;
        text-align: center;
    }

    .custom-bg-img {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 100%; height: 100%;
        z-index: -1000;
        display: block;
    }

    .page-content {
        box-sizing: border-box;
    }

    .logo-container { margin-bottom: 8px; }
    .logo { max-height: 60px; max-width: 250px; }
    
    .given-to { font-size: 11pt; color: #475569; margin-bottom: 4px; }
    .as-role { font-size: 11pt; color: #475569; margin-bottom: 4px; }
    
    .description {
        font-size: {{ $font_size_body ?? 11 }}pt;
        line-height: 1.5;
        color: #334155;
        margin-bottom: 8px;
        padding: 0 20px;
    }

    /* Absolute Placement container for signatures */
    .signature-container-block {
        position: absolute;
        text-align: right;
    }

    .signature-date  { font-size: 10pt; margin-bottom: 3px; }
    .signature-title { font-size: 10pt; font-weight: bold; margin-bottom: 5px; }
    .signature-name  {
        font-size: 12pt;
        font-weight: bold;
        border-top: 1px solid #000;
        padding-top: 5px;
        display: inline-block;
        min-width: 180px;
        text-align: center;
    }
    
    /* Page 2 specific */
    .table-title {
        font-size: 15pt;
        font-weight: bold;
        margin-bottom: 15px;
        color: {{ $font_color_labels ?? '#0f172a' }};
        text-transform: uppercase;
    }
    .competency-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: {{ $fontSize }};
    }
    .competency-table th {
        background-color: transparent;
        border: 1px solid {{ $font_color_labels ?? '#cbd5e1' }};
        padding: {{ $cellPadding }};
        font-weight: bold;
        color: {{ $font_color_labels ?? '#0f172a' }};
    }
    .competency-table td {
        background-color: transparent;
        border: 1px solid {{ $font_color_labels ?? '#cbd5e1' }};
        padding: {{ $cellPadding }};
        vertical-align: middle;
        color: {{ $font_color_body ?? '#334155' }};
    }
    .text-center { text-align: center; }
    .text-left { text-align: left; }

    .signature-section-flow {
        margin-top: 15px;
        page-break-inside: avoid;
    }
</style>
</head>
<body>
    <!-- Page 1 -->
    <div class="page-1">
        @if(!$background_base64)
            <div class="main-border"></div>
            <div class="inner-border"></div>
        @else
            <img class="custom-bg-img" src="{{ $background_base64 }}" alt="Background Design">
        @endif
        <div class="page-content">
        <!-- Logo -->
        @if($show_logo)
            <div class="logo-container" style="margin-top: {{ 10 + $logo_y }}pt; margin-left: {{ $logo_x }}pt; text-align: {{ $logo_position }};">
                @if($logo_base64)
                    <img class="logo" src="{{ $logo_base64 }}" alt="Company Logo">
                @else
                    <h2 style="margin:0; font-size: 24pt; color:#2563eb;">{{ $company ? $company->name : 'COMPANY LOGO' }}</h2>
                @endif
            </div>
        @endif

        <!-- Title -->
        @if($show_title)
            <div class="cert-title" style="margin-top: {{ 10 + $title_y }}pt; margin-left: {{ $title_x }}pt; font-size: {{ $font_size_title ?? 30 }}pt;{{ $font_color_title ? ' color: ' . $font_color_title . ';' : '' }}">SERTIFIKAT</div>
            <div style="font-size: 8pt; color: {{ $font_color_cert_id ?? '#64748b' }}; margin-bottom: 6px;">No: {{ $certNumber }}</div>
        @endif
        
        <!-- Recipient Block -->
        @if($show_recipient)
            <div style="width: 80%; margin: {{ 5 + $recipient_y }}pt auto 0 auto; position: relative; left: {{ $recipient_x }}pt;">
                <div class="given-to" style="{{ $font_color_labels ? 'color: ' . $font_color_labels . ';' : '' }}">diberikan kepada:</div>
                <div class="candidate-name" style="font-size: {{ $font_size_name ?? 34 }}pt;{{ $font_color_name ? ' color: ' . $font_color_name . ';' : '' }}">{{ $submission->user->name }}</div>
                @if($show_body)
                    <div class="description" style="font-size: {{ $font_size_body ?? 11 }}pt;{{ $font_color_body ? ' color: ' . $font_color_body . ';' : '' }}">
                        Telah menyelesaikan program magang di <strong>{{ $company ? $company->name : '-' }}</strong> 
                        pada program <strong>{{ $submission->vacancy->title }}</strong> bertipe <strong>{{ $submission->vacancy->type }}</strong><br>
                        yang dilaksanakan pada tanggal 
                        <strong>{{ \Carbon\Carbon::parse($submission->vacancy->start_date)->translatedFormat('d F Y') }}</strong> 
                        - 
                        <strong>{{ \Carbon\Carbon::parse($submission->vacancy->end_date)->translatedFormat('d F Y') }}</strong>
                    </div>
                @endif
                <div class="as-role" style="{{ $font_color_labels ? 'color: ' . $font_color_labels . ';' : '' }}">Sebagai:</div>
                <div class="internship-type" style="{{ $font_color_role ? 'color: ' . $font_color_role . ';' : '' }}">{{ strtoupper($submission->position ? $submission->position->name : '-') }}</div>
            </div>
        @endif


        </div><!-- end page-content -->
        
        <!-- Signatures absolute block -->
        @if($show_signatures)
            @php
                $sigBottom = max(20, 30 - $signature_y);
                $sigLeft = $signature_x > 0 ? $signature_x : 0;
                $sigRight = $signature_x < 0 ? abs($signature_x) : 0;
            @endphp
            <div class="signature-container-block" style="bottom: {{ $sigBottom }}px; left: {{ $sigLeft }}px; right: {{ $sigRight }}px; {{ $signature_layout === 'double' ? 'text-align: center;' : 'text-align: right;' }}">
                @php $sigStyle = $font_color_signatures ? 'color: ' . $font_color_signatures . ';' : ''; @endphp
                @if($signature_layout === 'double')
                    <!-- Double Signatures Side by Side -->
                    <table style="width: 100%; border: none; background: transparent;">
                        <tr>
                            <td style="width: 50%; text-align: center; border: none; padding: 0;">
                                <div class="signature-date" style="{{ $sigStyle }}">{{ $companyCity }}, {{ $issuedDate }}</div>
                                <div class="signature-title" style="{{ $sigStyle }}">{{ $signatory2_title }}</div>
                                @if(isset($signature2_base64) && $signature2_base64)
                                    <div style="margin-bottom: 5px;">
                                        <img src="{{ $signature2_base64 }}" style="max-height: 70px; max-width: 140px; display: inline-block;" alt="Signature 2">
                                    </div>
                                @else
                                    <div style="height: 75px;"></div>
                                @endif
                                <div class="signature-name" style="min-width: 160px; {{ $sigStyle }}">{{ $signatory2_name }}</div>
                            </td>
                            <td style="width: 50%; text-align: center; border: none; padding: 0;">
                                <div class="signature-date" style="{{ $sigStyle }}">{{ $companyCity }}, {{ $issuedDate }}</div>
                                <div class="signature-title" style="{{ $sigStyle }}">{{ $signatory1_title }}</div>
                                @if(isset($signature_base64) && $signature_base64)
                                    <div style="margin-bottom: 5px;">
                                        <img src="{{ $signature_base64 }}" style="max-height: 70px; max-width: 140px; display: inline-block;" alt="Signature 1">
                                    </div>
                                @else
                                    <div style="height: 75px;"></div>
                                @endif
                                <div class="signature-name" style="min-width: 160px; {{ $sigStyle }}">{{ $signatory1_name }}</div>
                            </td>
                        </tr>
                    </table>
                @else
                    <!-- Single Signature - right-aligned to match preview -->
                    <div style="display: inline-block; text-align: center; margin-right: 30px;">
                        <div class="signature-date" style="{{ $sigStyle }}">{{ $companyCity }}, {{ $issuedDate }}</div>
                        <div class="signature-title" style="{{ $sigStyle }}">{{ $signatory1_title }}</div>
                        @if(isset($signature_base64) && $signature_base64)
                            <div style="margin-bottom: 5px;">
                                <img src="{{ $signature_base64 }}" style="max-height: 75px; max-width: 150px; display: inline-block;" alt="Signature">
                            </div>
                        @else
                            <div style="height: 80px;"></div>
                        @endif
                        <div class="signature-name" style="min-width: 160px; {{ $sigStyle }}">{{ $signatory1_name }}</div>
                    </div>
                @endif
            </div>
        @endif
        
        <!-- QR Code Block & Cert Number -->
        <div style="position: absolute; bottom: {{ max(20, 30 + $qr_y) }}px; {{ $qr_position === 'bottom-left' ? 'left: ' . ($qr_x > 0 ? $qr_x : 0) . 'px' : 'right: ' . (abs($qr_x)) . 'px' }}; text-align: left; display: {{ $show_qr ? 'block' : 'none' }};">
            @if($qr_base64)
                <div style="margin-bottom: 3px;">
                    <img src="{{ $qr_base64 }}" style="width: 65px; height: 65px;" alt="Verification QR">
                </div>
            @endif
            <div style="font-size: 8pt; color: {{ $font_color_cert_id ?? '#64748b' }}; line-height: 1.2;">
                No: {{ $certNumber }}<br>
                @if($show_qr)
                    <span style="font-size: 6.5pt; color: {{ $font_color_cert_id ? $font_color_cert_id : '#94a3b8' }};">Scan to verify validity</span>
                @endif
            </div>
        </div>

        <!-- Extra Custom Image Elements -->
        @if(isset($layout_settings['custom_images']) && is_array($layout_settings['custom_images']))
            @foreach($layout_settings['custom_images'] as $img)
                @if(isset($img['visible']) && $img['visible'] && isset($img['url']) && $img['url'])
                    <img src="{{ $img['url'] }}" style="position: absolute; top: {{ (int) ($img['y'] ?? 100) }}pt; left: {{ (int) ($img['x'] ?? 100) }}pt; width: {{ (int) ($img['width'] ?? 80) }}pt; height: {{ (int) ($img['height'] ?? 40) }}pt; z-index: 50;">
                @endif
            @endforeach
        @endif
    </div>

    <!-- Page 2 (Dynamic Flow) -->
    <div class="page-2">
        @if(!$background_base64)
            <div class="main-border"></div>
            <div class="inner-border"></div>
        @else
            <img class="custom-bg-img" src="{{ $background_base64 }}" alt="Background Design">
        @endif
        <div class="table-title">CAPAIAN PEMBELAJARAN PROGRAM</div>
        
        <table class="competency-table">
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 20%">Kompetensi</th>
                    <th style="width: 25%">Definisi Kompetensi</th>
                    <th style="width: 30%">Deskripsi Nilai Capaian</th>
                    <th style="width: 10%">Jam</th>
                    <th style="width: 10%">Nilai Capaian</th>
                </tr>
            </thead>
            <tbody>
                @foreach($competencies as $index => $comp)
                    @php
                        // Dynamic length truncation for high competency count
                        $definition = $comp['description'];
                        $achievement = $comp['achievement_description'];
                        if ($compCount > 7) {
                            $definition = strlen($definition) > 120 ? substr($definition, 0, 117) . '...' : $definition;
                            $achievement = strlen($achievement) > 120 ? substr($achievement, 0, 117) . '...' : $achievement;
                        }
                    @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="text-left" style="font-weight: bold;">{{ $comp['name'] }}</td>
                        <td class="text-left" style="font-size: {{ $descFontSize }};">{{ $definition }}</td>
                        <td class="text-left" style="font-size: {{ $descFontSize }};">{{ $achievement }}</td>
                        <td class="text-center">{{ $comp['hours'] }}</td>
                        <td class="text-center" style="font-weight: bold; color: #8b5cf6;">{{ $comp['score'] }}</td>
                    </tr>
                @endforeach
                @if(count($competencies) === 0)
                    <tr>
                        <td colspan="6" class="text-center">Belum ada data kompetensi yang dinilai</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Signature follows right after table -->
        @if($show_signatures)
            @if($signature_layout === 'double')
                <div class="signature-section-flow" style="margin-top: {{ $sigMargin }};">
                    <table style="width: 100%; border: none; background: transparent;">
                        <tr>
                            <td style="width: 50%; text-align: center; border: none; padding: 0; vertical-align: top;">
                                <div class="signature-date" style="color: {{ $font_color_signatures ?? '#334155' }};">{{ $companyCity }}, {{ $issuedDate }}</div>
                                <div class="signature-title" style="color: {{ $font_color_signatures ?? '#334155' }};">{{ $signatory2_title }}</div>
                                @if(isset($signature2_base64) && $signature2_base64)
                                    <div style="margin-bottom: 5px;">
                                        <img src="{{ $signature2_base64 }}" style="max-height: 55px; max-width: 120px; display: inline-block;" alt="Signature 2">
                                    </div>
                                @else
                                    <div style="height: 60px;"></div>
                                @endif
                                <div class="signature-name" style="border-top: 1px solid {{ $font_color_signatures ?? '#000' }}; padding-top: 3px; display: inline-block; min-width: 150px; font-weight: bold; color: {{ $font_color_signatures ?? '#334155' }};">{{ $signatory2_name }}</div>
                            </td>
                            <td style="width: 50%; text-align: center; border: none; padding: 0; vertical-align: top;">
                                <div class="signature-date" style="color: {{ $font_color_signatures ?? '#334155' }};">{{ $companyCity }}, {{ $issuedDate }}</div>
                                <div class="signature-title" style="color: {{ $font_color_signatures ?? '#334155' }};">{{ $signatory1_title }}</div>
                                @if(isset($signature_base64) && $signature_base64)
                                    <div style="margin-bottom: 5px;">
                                        <img src="{{ $signature_base64 }}" style="max-height: 55px; max-width: 120px; display: inline-block;" alt="Signature 1">
                                    </div>
                                @else
                                    <div style="height: 60px;"></div>
                                @endif
                                <div class="signature-name" style="border-top: 1px solid {{ $font_color_signatures ?? '#000' }}; padding-top: 3px; display: inline-block; min-width: 150px; font-weight: bold; color: {{ $font_color_signatures ?? '#334155' }};">{{ $signatory1_name }}</div>
                            </td>
                        </tr>
                    </table>
                </div>
            @else
                <div class="signature-section-flow" style="margin-top: {{ $sigMargin }}; text-align: right;">
                    <div style="display: inline-block; text-align: center; margin-right: 40px;">
                        <div class="signature-date" style="color: {{ $font_color_signatures ?? '#334155' }};">{{ $companyCity }}, {{ $issuedDate }}</div>
                        <div class="signature-title" style="color: {{ $font_color_signatures ?? '#334155' }};">{{ $signatory1_title }}</div>
                        @if(isset($signature_base64) && $signature_base64)
                            <div style="margin-bottom: 5px;">
                                <img src="{{ $signature_base64 }}" style="max-height: 55px; max-width: 130px; display: inline-block;" alt="Signature">
                            </div>
                        @else
                            <div style="height: 60px;"></div>
                        @endif
                        <div class="signature-name" style="border-top: 1px solid {{ $font_color_signatures ?? '#000' }}; padding-top: 3px; display: inline-block; min-width: 160px; font-weight: bold; color: {{ $font_color_signatures ?? '#334155' }};">{{ $signatory1_name }}</div>
                    </div>
                </div>
            @endif
        @endif
    </div><!-- end page-2 -->

</body>
</html>
