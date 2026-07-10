#!/usr/bin/env python3
"""Build a raw DuckDB database from the hackathon_data CSV dump.

One table per CSV file (filename minus `.csv`), loaded with all_varchar=True so
loads never fail on mixed / separator-formatted numeric values. The agent (or SQL)
is responsible for casting string numerics to numbers.

Usage:
    python build_duckdb.py [--data-dir DIR] [--db PATH]
"""
import argparse
import glob
import os
import sys

import duckdb


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    default_data = os.path.abspath(os.path.join(here, ".."))
    default_db = os.path.join(default_data, "hackathon.duckdb")

    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", default=default_data)
    ap.add_argument("--db", default=default_db)
    args = ap.parse_args()

    db_path = os.path.abspath(args.db)
    if os.path.exists(db_path):
        os.remove(db_path)

    con = duckdb.connect(db_path)
    con.execute("PRAGMA threads=4;")

    csvs = sorted(glob.glob(os.path.join(args.data_dir, "*.csv")))
    print(f"Building {db_path} from {len(csvs)} CSVs in {args.data_dir}\n")

    counts = []
    for path in csvs:
        name = os.path.splitext(os.path.basename(path))[0]
        sql = (
            f"CREATE OR REPLACE TABLE {name} AS "
            f"SELECT * FROM read_csv_auto('{path}', all_varchar=true, header=true, "
            f"sample_size=-1, ignore_errors=false);"
        )
        try:
            con.execute(sql)
            n = con.execute(f'SELECT COUNT(*) FROM "{name}"').fetchone()[0]
            counts.append((name, n))
            print(f"  {name:32s} {n:>10,}")
        except Exception as e:  # pragma: no cover
            print(f"  {name:32s} FAILED: {e}", file=sys.stderr)

    # Convenience views that clean the most-queried numeric columns.
    views = [
        (
            "v_simpanan",
            "simpanan_anggota",
            "koperasi_ref, anggota_ref, periode_pembayaran, status, "
            "CAST(replace(replace(jumlah_simpanan,'.',''),',','.') AS DOUBLE) AS jumlah_simpanan_num",
        ),
        (
            "v_transaksi_penjualan",
            "transaksi_penjualan",
            "koperasi_ref, nama_pelanggan, metode_pembayaran, status_transaksi, "
            "CAST(replace(replace(total_pembayaran,'.',''),',','.') AS DOUBLE) AS total_pembayaran_num",
        ),
        (
            "v_profil_desa",
            "referensi_profil_desa",
            "kode_wilayah, total_penduduk, penduduk_laki_laki, penduduk_perempuan, "
            "CAST(replace(replace(anggaran_dana_desa,'.',''),',','.') AS DOUBLE) AS anggaran_dana_desa_num",
        ),
    ]
    for vname, base, cols in views:
        try:
            con.execute(f'CREATE OR REPLACE VIEW {vname} AS SELECT {cols} FROM "{base}";')
            print(f"  view {vname} created")
        except Exception as e:  # pragma: no cover
            print(f"  view {vname} FAILED: {e}", file=sys.stderr)

    con.close()
    total = sum(n for _, n in counts)
    print(f"\nDone: {len(counts)} tables, {total:,} rows -> {db_path}")


if __name__ == "__main__":
    main()
