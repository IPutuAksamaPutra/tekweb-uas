import QRCode from "react-qr-code";

interface Props {
    data: any;
}

export default function StrukPembayaran({ data }: Props) {

    const formatRp = (v: number) => v.toLocaleString("id-ID");

    return (
        <div
            className="print-area"
            style={{
                width: "58mm",
                padding: "4px",
                background: "white",
                fontFamily: "monospace",
                fontSize: "11px",
                color: "black",
            }}
        >

            {/* ==== LOGO ==== */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <div
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: "#234C6A",
                        margin: "0 auto 4px auto",
                    }}
                />
                <div style={{ fontSize: 13, fontWeight: "bold" }}>🔥 BENGKEL DUMMY MOTOR</div>
                <div>Jl. Dummy Raya No. 123</div>
                <div>Telp: 0812-0000-0000</div>
                <hr />
            </div>

            {/* ==== INFO TRANSAKSI ==== */}
            <div>
                <div>ID : {data.id}</div>
                <div>Tanggal : {data.transaction_date}</div>
                <div>Metode : {data.payment_method}</div>
            </div>

            <hr />

            {/* ==== ITEM ==== */}
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>{data.item_name}</div>
            <div>{data.qty} x Rp {formatRp(data.item_price)}</div>

            {/* ==== EXTRA ==== */}
            {data.extra_name && data.extra_price > 0 && (
                <>
                    <div>+ {data.extra_name}</div>
                    <div>Rp {formatRp(data.extra_price)}</div>
                </>
            )}

            <hr />

            {/* ==== TOTAL ==== */}
            <div style={{ fontWeight: "bold" }}>
                Total: Rp {formatRp(data.total)}
            </div>
            <div>Bayar: Rp {formatRp(data.bayar)}</div>
            <div>Kembali: Rp {formatRp(data.kembali)}</div>

            <hr />

            {/* ==== QR TRANSAKSI ==== */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <QRCode value={`TRX-ID-${data.id}`} size={90} />
                <div style={{ fontSize: 10 }}>Scan untuk validasi transaksi</div>
            </div>

            {/* ==== QR PEMBAYARAN ==== */}
            <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                    QR Pembayaran (Dummy)
                </div>
                <QRCode value="DUMMY-QR-PAYMENT" size={80} />
            </div>

            <hr />

            {/* ==== FOOTER ==== */}
            <div style={{ textAlign: "center", marginTop: 6 }}>
                Terima Kasih 🙏 <br />
                Semoga selamat di perjalanan!
            </div>

        </div>
    );
}
