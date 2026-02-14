const { createUploadthing } = require("uploadthing/express");

const f = createUploadthing();

const uploadRouter = {
    // Route for uploading documents (PDFs, text)
    documentUploader: f({
        pdf: {
            maxFileSize: "16MB",
            maxFileCount: 1,
        },
        text: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    }).onUploadComplete((data) => {
        console.log("Upload completed for documentUploader:", data);
    }),
};

module.exports = { uploadRouter };
