export const CATEGORIES = [
    "history",
    "science",
    "sports_and_games",
    "technology",
    "arts_and_entertainment",
    "philosophy_and_religion",
    "geography",
    "society_and_politics",
    "business_and_economics",
    "health_and_medicine",
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

export const tweaks = {
    "ChatInput-qBbK8": {
        files: "",
        //"input_value": "{\"user_id\":\"8888888888\", \"user_question\":\"What's my event summary?\"}",
        sender: "User",
        sender_name: "User",
        session_id: "",
        should_store_message: true,
    },
    "Memory-mf9Rj": {
        n_messages: 100,
        order: "Ascending",
        sender: "Machine and User",
        sender_name: "",
        session_id: "",
        template: "{sender_name}: {text}",
    },
    "AstraDB-TYZWg": {
        api_endpoint: "ASTRA_ENDPOINT",
        batch_size: null,
        bulk_delete_concurrency: null,
        bulk_insert_batch_concurrency: null,
        bulk_insert_overwrite_concurrency: null,
        collection_indexing_policy: "",
        collection_name: "questions",
        metadata_indexing_exclude: "",
        metadata_indexing_include: "",
        metric: "",
        namespace: "default_namespace",
        number_of_results: 4,
        pre_delete_collection: false,
        search_filter: {},
        search_input: "",
        search_score_threshold: 0,
        search_type: "Similarity",
        setup_mode: "Sync",
        token: "ASTRA_DB_TOKEN",
    },
    "CustomComponent-Sz0Qi": {
        input_value: "",
    },
    "ParseData-GPBs1": {
        sep: "\n",
        template: "{user_question}",
    },
    "OpenAIEmbeddings-pty3P": {
        chunk_size: 1000,
        client: "",
        default_headers: {},
        default_query: {},
        deployment: "",
        dimensions: null,
        embedding_ctx_length: 1536,
        max_retries: 3,
        model: "text-embedding-3-large",
        model_kwargs: {},
        openai_api_base: "",
        openai_api_key: "OPENAI_API_KEY",
        openai_api_type: "",
        openai_api_version: "",
        openai_organization: "",
        openai_proxy: "",
        request_timeout: null,
        show_progress_bar: false,
        skip_empty: false,
        tiktoken_enable: true,
        tiktoken_model_name: "",
    },
    "AstraDB-B96xa": {
        collection_name: "question_instruction",
        database_id: "ASTRA_DB_DATABASE_ID",
        key_column_name: "question_id",
        namespace: "default_namespace",
        token: "ASTRA_DB_TOKEN",
    },
    "ParseData-Kbr1J": {},
    "CustomComponent-tNuWo": {},
    "CustomComponent-Lb2HY": {
        DB_ID: "ASTRA_DB_DATABASE_ID",
        DB_TOKEN: "ASTRA_DB_TOKEN",
    },
    "CustomComponent-YMsHE": {},
    "Prompt-l7YlL": {
        template:
            "You're helping a customer support agent with a customer. Please answer the customer's question based ONLY on the provided data and instructions (for interpreting the data) below. Please use the instructions in the JSON below to interpret the data. If the data retrieved is NULL for a field expected to exist to answer the question, say the data doesn't exist for that question. Otherwise, if you don't know the answer based on the available information, just say you don't know. Also, don't answer questions you've already answered in the previous chat context. \n\nCustomer question - THIS is the question you need to answer:\n\n{user_question}\n\n\n\n\nData and instructions:\n\n{rows}\n\n\n\n\n\nPrevious chat context - don't answer these questions:\n\n\n{chat_history}",
        rows: "",
        user_question: "",
        chat_history: "",
    },
    "ParseData-616KE": {
        sep: "\n",
        template: "{rows}",
    },
    "ParseData-nmbnH": {
        sep: "\n",
        template: "{user_question}",
    },
    "OpenAIModel-fwMSu": {
        api_key: "OPENAI_API_KEY",
        input_value: "",
        json_mode: false,
        max_tokens: null,
        model_kwargs: {},
        model_name: "gpt-4o",
        openai_api_base: "",
        output_schema: {},
        seed: 1,
        stream: false,
        system_message: "",
        temperature: 0.1,
    },
    "ChatOutput-S4jn4": {
        data_template: "{text}",
        input_value: "",
        sender: "Machine",
        sender_name: "AI",
        session_id: "",
        should_store_message: true,
    },
    "CustomComponent-xalJ6": {
        DB_HOST: "MYSQL_HOST",
        DB_NAME: "MYSQL_DB",
        DB_PASSWORD: "MYSQL_PASSWORD",
        DB_USER: "MYSQL_USER",
    },
};

export const example_questions = [
    {
        question_id: 1,
        question: "When did the user last login?",
        query: "SELECT * FROM default_namespace.login_data WHERE cus_id = @user_id",
        instruction: "Check the LATEST_LOGIN_ON date and provide that to answer this question.",
        system: "cassandra",
    },
    {
        question_id: 2,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 3,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 4,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 5,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 6,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 7,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 8,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 9,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
    {
        question_id: 10,
        question: "Did this user classify? Was customer audited?",
        query: "SELECT * FROM default_namespace.base_data WHERE int_id = @user_id",
        instruction:
            "Check if SPL_CUS_TYPE = C. If so, then the user did classify, which means they can't redeem or utilize their miles.",
        system: "cassandra",
    },
];
