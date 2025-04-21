package com.sismics.docs.core.util;

import com.sismics.docs.core.model.jpa.Document;
import com.sismics.docs.core.model.jpa.File;
import com.sismics.docs.core.util.indexing.LuceneIndexingHandler;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.*;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.lang.reflect.Field;

import static org.junit.Assert.*;

public class LuceneIndexingHandlerTest {

    private LuceneIndexingHandler luceneIndexingHandler;
    private Directory directory;
    private IndexWriter indexWriter;

    @Before
    public void setUp() throws Exception {
        // 初始化内存目录
        directory = new RAMDirectory();

        // 创建索引写入器配置
        IndexWriterConfig config = new IndexWriterConfig(new StandardAnalyzer());
        config.setOpenMode(IndexWriterConfig.OpenMode.CREATE_OR_APPEND);

        // 创建索引写入器
        indexWriter = new IndexWriter(directory, config);

        // 初始化处理器
        luceneIndexingHandler = new LuceneIndexingHandler();

        // 使用反射注入依赖
        setPrivateField(luceneIndexingHandler, "directory", directory);
        setPrivateField(luceneIndexingHandler, "indexWriter", indexWriter);

        // 确保目录读取器初始化
        refreshReader();
    }

    @After
    public void tearDown() throws Exception {
        if (luceneIndexingHandler != null) {
            luceneIndexingHandler.shutDown();
        }
        if (indexWriter != null) {
            indexWriter.close();
        }
        if (directory != null) {
            directory.close();
        }
    }

    @Test
    public void testStartUp() throws Exception {
        assertNotNull(getPrivateField(luceneIndexingHandler, "directoryReader"));
    }

    @Test
    public void testClearIndex() throws Exception {
        // 先添加测试数据
        Document document = new Document();
        document.setId("1");
        document.setTitle("Test Document");
        luceneIndexingHandler.createDocument(document);

        // 验证索引中有文档
        refreshReader();
        DirectoryReader reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(1, reader.numDocs());

        // 执行清除操作
        luceneIndexingHandler.clearIndex();

        // 验证索引已清空
        refreshReader();
        reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(0, reader.numDocs());
    }

    @Test
    public void testCreateDocument() throws Exception {
        Document document = new Document();
        document.setId("1");
        document.setTitle("Test Document");

        luceneIndexingHandler.createDocument(document);

        // 验证文档已创建
        refreshReader();
        DirectoryReader reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(1, reader.numDocs());
    }

    @Test
    public void testCreateFile() throws Exception {
        File file = new File();
        file.setId("1");
        file.setName("Test File");
        file.setDocumentId("doc1");

        luceneIndexingHandler.createFile(file);

        // 验证文件已创建
        refreshReader();
        DirectoryReader reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(1, reader.numDocs());
    }

    @Test
    public void testUpdateDocument() throws Exception {
        // 先创建文档
        Document document = new Document();
        document.setId("1");
        document.setTitle("Original Title");
        luceneIndexingHandler.createDocument(document);

        // 更新文档
        document.setTitle("Updated Title");
        luceneIndexingHandler.updateDocument(document);

        // 验证更新成功
        refreshReader();
        DirectoryReader reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(1, reader.numDocs());
    }

    @Test
    public void testUpdateFile() throws Exception {
        // 先创建文件
        File file = new File();
        file.setId("1");
        file.setName("Original Name");
        file.setDocumentId("doc1");
        luceneIndexingHandler.createFile(file);

        // 更新文件
        file.setName("Updated Name");
        luceneIndexingHandler.updateFile(file);

        // 验证更新成功
        refreshReader();
        DirectoryReader reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(1, reader.numDocs());
    }

    @Test
    public void testDeleteDocument() throws Exception {
        // 先创建文档
        Document document = new Document();
        document.setId("1");
        document.setTitle("To Be Deleted");
        luceneIndexingHandler.createDocument(document);

        // 删除文档
        luceneIndexingHandler.deleteDocument("1");

        // 验证文档已删除
        refreshReader();
        DirectoryReader reader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        assertEquals(0, reader.numDocs());
    }

    /**
     * 刷新目录读取器
     */
    private void refreshReader() throws Exception {
        DirectoryReader currentReader = (DirectoryReader) getPrivateField(luceneIndexingHandler, "directoryReader");
        if (currentReader == null) {
            DirectoryReader newReader = DirectoryReader.open(directory);
            setPrivateField(luceneIndexingHandler, "directoryReader", newReader);
        } else {
            DirectoryReader newReader = DirectoryReader.openIfChanged(currentReader);
            if (newReader != null) {
                currentReader.close();
                setPrivateField(luceneIndexingHandler, "directoryReader", newReader);
            }
        }
    }

    /**
     * 使用反射设置私有字段
     */
    private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    /**
     * 使用反射获取私有字段
     */
    private Object getPrivateField(Object target, String fieldName) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(target);
    }
}