<!DOCTYPE html>
<html>
<head>
<meta content="text/html; charset=UTF-8" http-equiv="content-type">
<style type="text/css">
    @page { 
        size: A4 landscape;
        margin: 30px;
    }
    body {
        font-family: "Arial", sans-serif;
        color: #1e293b;
        margin: 0;
        padding: 40px 60px; /* Padding for flow content to stay inside borders */
    }
    
    /* Fixed borders will repeat on every page */
    .main-border {
        position: fixed;
        top: 0px; left: 0px; right: 0px; bottom: 0px;
        border: 3px solid #3b82f6;
        z-index: -1;
    }
    .inner-border {
        position: fixed;
        top: 10px; left: 10px; right: 10px; bottom: 10px;
        border: 1px solid #93c5fd;
        z-index: -1;
    }

    .page-1 {
        page-break-after: always;
        position: relative;
        height: 640px; /* Approximate height for A4 landscape inside margins */
        text-align: center;
    }

    .logo-container { margin-bottom: 10px; text-align: center; }
    .logo { max-height: 80px; max-width: 250px; }
    
    .cert-title {
        font-size: 30pt;
        letter-spacing: 6px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 10px;
        margin-bottom: 15px;
        text-transform: uppercase;
    }
    .given-to { font-size: 11pt; color: #475569; margin-bottom: 10px; }
    .candidate-name {
        font-size: 34pt;
        font-family: "Times New Roman", serif;
        font-style: italic;
        color: #0f172a;
        margin-bottom: 15px;
        text-transform: capitalize;
    }
    .as-role { font-size: 11pt; color: #475569; margin-bottom: 10px; }
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
    .description {
        font-size: 11pt;
        line-height: 1.8;
        color: #334155;
        margin-bottom: 15px;
        padding: 0 100px;
    }

    
    .signature-section-absolute {
        position: absolute;
        bottom: 0px;
        right: 0px;
        text-align: right;
    }

    .signature-section-flow {
        margin-top: 40px;
        text-align: right;
        page-break-inside: avoid;
    }

    .signature-date { font-size: 11pt; margin-bottom: 5px; }
    .signature-title { font-size: 11pt; font-weight: bold; margin-bottom: 110px; }
    .signature-name {
        font-size: 12pt;
        font-weight: bold;
        border-top: 1px solid #000;
        padding-top: 5px;
        display: inline-block;
        min-width: 180px;
        text-align: center;
    }
    
    /* Page 2 specific */
    .page-2 {
        text-align: center;
    }
    .table-title {
        font-size: 20pt;
        font-weight: bold;
        margin-bottom: 30px;
        color: #0f172a;
        text-transform: uppercase;
    }
    .competency-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
        font-size: 11pt;
    }
    .competency-table th {
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        padding: 12px;
        font-weight: bold;
        color: #0f172a;
    }
    .competency-table td {
        border: 1px solid #cbd5e1;
        padding: 10px 12px;
        vertical-align: middle;
        color: #334155;
    }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
</style>
</head>
<body>
    <!-- Repeating Borders -->
    <div class="main-border"></div>
    <div class="inner-border"></div>

    <!-- Page 1 -->
    <div class="page-1">
        <div class="logo-container">
            @if($logo_base64)
                <img class="logo" src="{{ $logo_base64 }}" alt="Company Logo">
            @else
                <h2 style="margin:0; font-size: 24pt; color:#2563eb;">{{ $company ? $company->name : 'COMPANY LOGO' }}</h2>
            @endif
        </div>

        <div class="cert-title">SERTIFIKAT</div>
        <div class="given-to">diberikan kepada:</div>
        <div class="candidate-name">{{ $submission->user->name }}</div>
        <div class="as-role">Sebagai:</div>
        <div class="internship-type">{{ strtoupper($submission->position ? $submission->position->name : '-') }}</div>
        
        <div class="description">
            Telah menyelesaikan program magang di <strong>{{ $company ? $company->name : '-' }}</strong> 
            pada program <strong>{{ $submission->vacancy->title }}</strong> bertipe <strong>{{ $submission->vacancy->type }}</strong><br>
            yang dilaksanakan pada tanggal 
            <strong>{{ \Carbon\Carbon::parse($submission->vacancy->start_date)->translatedFormat('d F Y') }}</strong> 
            - 
            <strong>{{ \Carbon\Carbon::parse($submission->vacancy->end_date)->translatedFormat('d F Y') }}</strong>
        </div>

        <div class="signature-section-absolute">
            <div class="signature-date">{{ $companyCity }}, {{ $issuedDate }}</div>
            <div class="signature-title">Mentor {{ $company ? $company->name : '' }}</div>
            <div class="signature-name">{{ $mentorName }}</div>
        </div>
        
        <div style="position: absolute; bottom: 0px; left: 0px; font-size: 10pt; color: #94a3b8; text-align: left;">
            No: {{ $certNumber }}
        </div>
    </div>

    <!-- Page 2, 3 (Dynamic Flow) -->
    <div class="page-2">
        <div class="table-title">CAPAIAN PEMBELAJARAN PROGRAM</div>
        
        <table class="competency-table">
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 25%">Kompetensi</th>
                    <th style="width: 35%">Definisi Kompetensi</th>
                    <th style="width: 10%">Jam</th>
                    <th style="width: 10%">Nilai Capaian</th>
                    <th style="width: 15%">Deskripsi Nilai Capaian</th>
                </tr>
            </thead>
            <tbody>
                @foreach($competencies as $index => $comp)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-left font-bold">{{ $comp['name'] }}</td>
                    <td class="text-left">{{ $comp['description'] }}</td>
                    <td class="text-center">{{ $comp['hours'] }}</td>
                    <td class="text-center" style="font-weight: bold;">{{ $comp['score'] }}</td>
                    <td class="text-center">{{ $comp['predicate'] }}</td>
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
        <div class="signature-section-flow">
            <div class="signature-date">{{ $companyCity }}, {{ $issuedDate }}</div>
            <div class="signature-title">Mentor {{ $company ? $company->name : '' }}</div>
            <div class="signature-name">{{ $mentorName }}</div>
        </div>
    </div>

</body>
</html>
