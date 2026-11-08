/**
 * ==============================================================================
 * BARBEARIA RIO PRETO — SERVIDOR E UTILITÁRIO PURO EM JAVA
 * Arquivo: arquivo.java
 * Stack: HTML, CSS e JAVA (Scripts e utilitários puros sem frameworks)
 * 
 * Este arquivo foi desenvolvido utilizando apenas as bibliotecas nativas do Java
 * (Java Standard Library), sem necessidade de Maven, Gradle, Spring ou qualquer biblioteca externa.
 * 
 * Funcionalidades:
 *  1. Inicia um Servidor Web HTTP local em http://localhost:8080 para visualizar o site
 *  2. Verifica e sincroniza a pasta /MIDEA com a galeria do index.html
 * 
 * Como executar (caso tenha o Java JDK 11+ instalado):
 *    java arquivo.java
 * ==============================================================================
 */

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

public class arquivo {

    private static final int PORTA = 8080;
    private static final Path DIRETORIO_RAIZ = Paths.get(".").toAbsolutePath().normalize();

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   BARBEARIA RIO PRETO — SÃO JOSÉ DO RIO PRETO   ");
        System.out.println("==================================================");
        System.out.println("Diretório do Projeto: " + DIRETORIO_RAIZ);

        // 1. Verifica pastas /MIDEA
        garantirEstruturaPastas();

        // 2. Inicia servidor HTTP embutido
        try {
            iniciarServidorWeb();
        } catch (IOException e) {
            System.err.println("Erro ao iniciar o servidor web na porta " + PORTA + ": " + e.getMessage());
        }
    }

    /**
     * Garante a existência da subpasta /MIDEA com /fotografia e /videos
     */
    private static void garantirEstruturaPastas() {
        Path pastaMidea = DIRETORIO_RAIZ.resolve("MIDEA");
        Path pastaFoto = pastaMidea.resolve("fotografia");
        Path pastaVideos = pastaMidea.resolve("videos");

        try {
            Files.createDirectories(pastaFoto);
            Files.createDirectories(pastaVideos);
            System.out.println("Estrutura /MIDEA/fotografia e /MIDEA/videos verificada com sucesso.");
        } catch (IOException e) {
            System.err.println("Aviso ao criar pastas: " + e.getMessage());
        }
    }

    /**
     * Inicia um servidor HTTP nativo e puro do Java
     */
    private static void iniciarServidorWeb() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORTA), 0);
        server.createContext("/", new FileHandler());
        server.setExecutor(null);
        server.start();

        System.out.println("\n✓ Servidor da Barbearia iniciado com sucesso!");
        System.out.println("👉 Acesse no navegador: http://localhost:" + PORTA + "/index.html");
        System.out.println("Pressione Ctrl + C para encerrar o servidor a qualquer momento.\n");
    }

    /**
     * Manipulador de requisições HTTP estáticas
     */
    static class FileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String uriPath = exchange.getRequestURI().getPath();
            if (uriPath == null || uriPath.equals("/") || uriPath.isEmpty()) {
                uriPath = "/index.html";
            }

            // Normaliza o caminho do arquivo solicitado
            Path filePath = DIRETORIO_RAIZ.resolve(uriPath.substring(1)).normalize();

            // Proteção contra Directory Traversal
            if (!filePath.startsWith(DIRETORIO_RAIZ) || !Files.exists(filePath) || Files.isDirectory(filePath)) {
                String respostaErro = "<h1>404 — Arquivo não encontrado</h1><p>Barbearia Rio Preto</p>";
                byte[] bytesErro = respostaErro.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                exchange.sendResponseHeaders(404, bytesErro.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytesErro);
                }
                return;
            }

            // Define o tipo MIME adequado
            String contentType = obterContentType(filePath.getFileName().toString());
            exchange.getResponseHeaders().set("Content-Type", contentType);

            byte[] fileBytes = Files.readAllBytes(filePath);
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }

        private String obterContentType(String nomeArquivo) {
            String lower = nomeArquivo.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".mp4")) return "video/mp4";
            if (lower.endsWith(".webm")) return "video/webm";
            return "application/octet-stream";
        }
    }
}
