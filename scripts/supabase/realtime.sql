-- Enable realtime updates for key workflow tables
ALTER PUBLICATION supabase_realtime ADD TABLE "SurplusBatch";
ALTER PUBLICATION supabase_realtime ADD TABLE "NgoRequest";
ALTER PUBLICATION supabase_realtime ADD TABLE "RecyclerJob";
ALTER PUBLICATION supabase_realtime ADD TABLE "WasteScan";

-- Optional: if you need updates from decisions and classifications
ALTER PUBLICATION supabase_realtime ADD TABLE "HumanDecision";
ALTER PUBLICATION supabase_realtime ADD TABLE "WasteClassification";

-- Verify publication members
SELECT *
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
