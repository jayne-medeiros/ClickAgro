<?php
// api.php - Com Edição e Substituição de Arquivos
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$dataFile = 'conteudos.json';
$uploadDir = 'uploads/'; 

if (!file_exists($uploadDir)) { mkdir($uploadDir, 0777, true); }
if (!file_exists($dataFile)) { file_put_contents($dataFile, json_encode([])); }

$method = $_SERVER['REQUEST_METHOD'];
$current_data = json_decode(file_get_contents($dataFile), true);

// 1. LER DADOS (GET)
if ($method === 'GET') {
    echo json_encode($current_data);
    exit;
}

// 2. RECEBER DADOS (POST)
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    // --- ADICIONAR NOVO ---
    if ($action === 'add') {
        $filePath = '';
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $fileName = time() . '_' . basename($_FILES['file']['name']);
            $targetPath = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                $filePath = $targetPath;
            }
        }

        $newItem = [
            'id' => time(),
            'title' => $_POST['title'] ?? 'Sem Título',
            'type' => $_POST['type'] ?? 'pdf',
            'msg' => $_POST['msg'] ?? '',
            'file_path' => $filePath,
            'date' => date('d/m/Y')
        ];

        array_unshift($current_data, $newItem);
        file_put_contents($dataFile, json_encode($current_data));
        echo json_encode(["status" => "success"]);
        exit;
    }

    // --- EDITAR EXISTENTE ---
    if ($action === 'edit') {
        $idToEdit = $_POST['id'];
        $foundIndex = -1;

        // Procura o índice do item
        foreach ($current_data as $index => $item) {
            if ($item['id'] == $idToEdit) {
                $foundIndex = $index;
                break;
            }
        }

        if ($foundIndex > -1) {
            // Atualiza Textos
            $current_data[$foundIndex]['title'] = $_POST['title'];
            $current_data[$foundIndex]['type'] = $_POST['type'];
            $current_data[$foundIndex]['msg'] = $_POST['msg'];

            // Se enviou NOVO arquivo, substitui o antigo
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                // 1. Apaga o velho
                $oldFile = $current_data[$foundIndex]['file_path'];
                if (file_exists($oldFile) && !empty($oldFile)) { unlink($oldFile); }

                // 2. Salva o novo
                $fileName = time() . '_' . basename($_FILES['file']['name']);
                $targetPath = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                    $current_data[$foundIndex]['file_path'] = $targetPath;
                }
            }

            file_put_contents($dataFile, json_encode($current_data));
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Item não encontrado"]);
        }
        exit;
    }

    // --- DELETAR ---
    if ($action === 'delete') {
        $idToDelete = $_POST['id'];
        foreach ($current_data as $item) {
            if ($item['id'] == $idToDelete && file_exists($item['file_path'])) {
                unlink($item['file_path']);
            }
        }
        $new_data = array_filter($current_data, function($item) use ($idToDelete) {
            return $item['id'] != $idToDelete;
        });
        file_put_contents($dataFile, json_encode(array_values($new_data)));
        echo json_encode(["status" => "deleted"]);
        exit;
    }
}
?>