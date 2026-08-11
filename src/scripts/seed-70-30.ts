import { NestFactory } from '@nestjs/core';
import { AppModule } from '../modules/app.module';
import { DataSource } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Strategy, StrategyType, StrategyStatus } from '../modules/strategy/entities/strategy.entity';
import { StrategySchedule } from '../modules/strategy/entities/strategy-schedule.entity';
import { Logger } from '@nestjs/common';

const strategyJson = {
    "strategy_info": {
        "id": "70-30",
        "name": "70/30 Balance Optimo",
        "description": "Balance entre ingresos por dividendos y crecimiento tecnologico",
        "monthly_budget_ars": 300000,
        "currency": "ARS",
        "horizon_years": 5,
        "risk_profile": "moderado",
        "allocation": {
            "diversificado": {
                "pct": 70,
                "monthly_ars": 210000,
                "label": "Diversificado"
            },
            "tech": {
                "pct": 30,
                "monthly_ars": 90000,
                "label": "Tecnologia"
            }
        }
    },
    "assets": {
        "SCHD": {
            "name": "Schwab US Dividend Equity ETF",
            "category": "diversificado",
            "sector": "ETF Diversificado",
            "div_yield": 3.4,
            "role": "Base calidad dividendos",
            "allocation_pct": 20
        },
        "VYM": {
            "name": "Vanguard High Dividend Yield ETF",
            "category": "diversificado",
            "sector": "ETF Diversificado",
            "div_yield": 2.9,
            "role": "Diversificacion maxima",
            "allocation_pct": 20
        },
        "KO": {
            "name": "Coca-Cola Company",
            "category": "diversificado",
            "sector": "Bebidas",
            "div_yield": 3.0,
            "role": "Dividendo consistente",
            "allocation_pct": 8
        },
        "JNJ": {
            "name": "Johnson & Johnson",
            "category": "diversificado",
            "sector": "Salud",
            "div_yield": 2.9,
            "role": "Sector defensivo",
            "allocation_pct": 7
        },
        "PG": {
            "name": "Procter & Gamble",
            "category": "diversificado",
            "sector": "Consumo Basico",
            "div_yield": 2.4,
            "role": "Estabilidad recesion",
            "allocation_pct": 5
        },
        "JPM": {
            "name": "JPMorgan Chase & Co.",
            "category": "diversificado",
            "sector": "Bancos",
            "div_yield": 2.4,
            "role": "Exposicion financiera",
            "allocation_pct": 5
        },
        "WMT": {
            "name": "Walmart Inc.",
            "category": "diversificado",
            "sector": "Retail",
            "div_yield": 1.3,
            "role": "Retail defensivo",
            "allocation_pct": 4
        },
        "O": {
            "name": "Realty Income Corp.",
            "category": "diversificado",
            "sector": "REITs",
            "div_yield": 5.2,
            "role": "Ingresos mensuales",
            "allocation_pct": 3
        },
        "MSFT": {
            "name": "Microsoft Corporation",
            "category": "tech",
            "sector": "Software/Cloud",
            "div_yield": 0.7,
            "role": "Tech blue-chip estable",
            "allocation_pct": 8
        },
        "NVDA": {
            "name": "NVIDIA Corporation",
            "category": "tech",
            "sector": "Semiconductores/IA",
            "div_yield": 0.03,
            "role": "Exposicion IA pura",
            "allocation_pct": 7
        },
        "AAPL": {
            "name": "Apple Inc.",
            "category": "tech",
            "sector": "Hardware/Software",
            "div_yield": 0.4,
            "role": "Ecosistema premium",
            "allocation_pct": 5
        },
        "GOOGL": {
            "name": "Alphabet Inc. (Google)",
            "category": "tech",
            "sector": "Internet/IA",
            "div_yield": 0.4,
            "role": "Busqueda + IA",
            "allocation_pct": 5
        },
        "AMD": {
            "name": "Advanced Micro Devices",
            "category": "tech",
            "sector": "Semiconductores",
            "div_yield": 0.0,
            "role": "Alternativa NVDA",
            "allocation_pct": 4
        },
        "META": {
            "name": "Meta Platforms Inc.",
            "category": "tech",
            "sector": "Social Media",
            "div_yield": 0.3,
            "role": "Social + Metaverse",
            "allocation_pct": 3
        }
    },
    "rebalance_rules": {
        "review_frequency": "quarterly",
        "rebalance_frequency": "annual",
        "tech_max_pct": 35,
        "div_min_pct": 65,
        "div_max_pct": 75,
        "company_max_pct": 15,
        "company_min_pct": 2,
        "rules": [
            {
                "trigger": "tech > 35%",
                "action": "Vender exceso tech, comprar Diversificado"
            },
            {
                "trigger": "div > 75%",
                "action": "Vender exceso div, comprar Tech"
            },
            {
                "trigger": "empresa > 15%",
                "action": "Tomar ganancias parciales"
            },
            {
                "trigger": "empresa < 2%",
                "action": "Consolidar o eliminar posicion"
            }
        ],
        "objectives": [
            "Mantener 70/30 allocation exacta",
            "Maximizar efecto vender alto - comprar bajo",
            "Controlar riesgo de concentracion",
            "Aprovechar ciclos sectoriales",
            "Optimizar carga impositiva",
            "Reinvertir dividendos estrategicamente"
        ]
    },
    "projection": {
        "expected_return_pct": 12.5,
        "years": 5,
        "volatility_range": "15-18%",
        "sharpe_ratio": 0.85,
        "max_drawdown_pct": -27.5,
        "recovery_months": 15,
        "yearly": [
            {
                "year": 1,
                "capital_invested": 3600000,
                "portfolio_value": 4050000,
                "dividends_annual": 115200,
                "growth_pct": 12.5,
                "volatility": "±18%"
            },
            {
                "year": 2,
                "capital_invested": 7200000,
                "portfolio_value": 8640000,
                "dividends_annual": 230400,
                "growth_pct": 12.5,
                "volatility": "±17%"
            },
            {
                "year": 3,
                "capital_invested": 10800000,
                "portfolio_value": 14310000,
                "dividends_annual": 345600,
                "growth_pct": 12.5,
                "volatility": "±16%"
            },
            {
                "year": 4,
                "capital_invested": 14400000,
                "portfolio_value": 21150000,
                "dividends_annual": 460800,
                "growth_pct": 12.5,
                "volatility": "±15%"
            },
            {
                "year": 5,
                "capital_invested": 18000000,
                "portfolio_value": 29500000,
                "dividends_annual": 576000,
                "growth_pct": 12.5,
                "volatility": "±14%"
            }
        ]
    },
    "comparison": [
        {
            "metric": "Rendimiento Esperado",
            "balance": "12.5% anual",
            "diversificado": "10% anual",
            "tech": "20% anual",
            "ventaja": "25% mas que Div"
        },
        {
            "metric": "Volatilidad",
            "balance": "15-18%",
            "diversificado": "10-12%",
            "tech": "25-35%",
            "ventaja": "40% menos que Tech"
        },
        {
            "metric": "Dividendos Año 5",
            "balance": "$576k/año",
            "diversificado": "$720k/año",
            "tech": "$72k/año",
            "ventaja": "8x mas que Tech"
        },
        {
            "metric": "Maxima Caida Esperada",
            "balance": "-25 a -30%",
            "diversificado": "-15 a -20%",
            "tech": "-50 a -60%",
            "ventaja": "Mitiga riesgo Tech"
        },
        {
            "metric": "Sharpe Ratio",
            "balance": "0.85",
            "diversificado": "0.70",
            "tech": "0.65",
            "ventaja": "Mejor eficiencia"
        },
        {
            "metric": "Recuperacion bear market",
            "balance": "12-18 meses",
            "diversificado": "8-12 meses",
            "tech": "24-36 meses",
            "ventaja": "Mas rapido que Tech"
        }
    ],
    "schedule": [
        {
            "month": 1,
            "label": "Enero",
            "orders": [
                {
                    "ticker": "SCHD",
                    "amount_ars": 180000,
                    "allocation_pct": 20,
                    "notes": "Base calidad dividendos"
                },
                {
                    "ticker": "MSFT",
                    "amount_ars": 90000,
                    "allocation_pct": 8,
                    "notes": "Tech blue-chip estable"
                }
            ]
        },
        {
            "month": 2,
            "label": "Febrero",
            "orders": [
                {
                    "ticker": "KO",
                    "amount_ars": 90000,
                    "allocation_pct": 8,
                    "notes": "Dividendo consistente - Aristocrata"
                },
                {
                    "ticker": "JNJ",
                    "amount_ars": 67500,
                    "allocation_pct": 7,
                    "notes": "Sector defensivo"
                },
                {
                    "ticker": "AAPL",
                    "amount_ars": 90000,
                    "allocation_pct": 5,
                    "notes": "Ecosistema premium"
                }
            ]
        },
        {
            "month": 3,
            "label": "Marzo",
            "orders": [
                {
                    "ticker": "VYM",
                    "amount_ars": 120000,
                    "allocation_pct": 20,
                    "notes": "Diversificacion maxima"
                },
                {
                    "ticker": "NVDA",
                    "amount_ars": 90000,
                    "allocation_pct": 7,
                    "notes": "Exposicion IA pura"
                }
            ]
        },
        {
            "month": 4,
            "label": "Abril",
            "orders": [
                {
                    "ticker": "PG",
                    "amount_ars": 75000,
                    "allocation_pct": 5,
                    "notes": "Estabilidad recesion"
                },
                {
                    "ticker": "WMT",
                    "amount_ars": 60000,
                    "allocation_pct": 4,
                    "notes": "Retail defensivo"
                },
                {
                    "ticker": "GOOGL",
                    "amount_ars": 90000,
                    "allocation_pct": 5,
                    "notes": "Busqueda + IA"
                }
            ]
        },
        {
            "month": 5,
            "label": "Mayo",
            "orders": [
                {
                    "ticker": "O",
                    "amount_ars": 90000,
                    "allocation_pct": 3,
                    "notes": "Ingresos mensuales - yield 5.2%"
                },
                {
                    "ticker": "JPM",
                    "amount_ars": 120000,
                    "allocation_pct": 5,
                    "notes": "Exposicion financiera"
                },
                {
                    "ticker": "AMD",
                    "amount_ars": 90000,
                    "allocation_pct": 4,
                    "notes": "Alternativa NVDA"
                }
            ]
        },
        {
            "month": 6,
            "label": "Junio",
            "orders": [
                {
                    "ticker": "JPM",
                    "amount_ars": 75000,
                    "allocation_pct": 5,
                    "notes": "Refuerzo financiero"
                },
                {
                    "ticker": "KO",
                    "amount_ars": 45000,
                    "allocation_pct": 8,
                    "notes": "Refuerzo aristocrata"
                },
                {
                    "ticker": "META",
                    "amount_ars": 90000,
                    "allocation_pct": 3,
                    "notes": "Social + Metaverse"
                }
            ]
        },
        {
            "month": 7,
            "label": "Julio",
            "orders": [
                {
                    "ticker": "SCHD",
                    "amount_ars": 150000,
                    "allocation_pct": 20,
                    "notes": "Refuerzo base ETF"
                },
                {
                    "ticker": "MSFT",
                    "amount_ars": 90000,
                    "allocation_pct": 8,
                    "notes": "Refuerzo cloud"
                }
            ]
        },
        {
            "month": 8,
            "label": "Agosto",
            "orders": [
                {
                    "ticker": "VYM",
                    "amount_ars": 120000,
                    "allocation_pct": 20,
                    "notes": "Refuerzo diversificacion"
                },
                {
                    "ticker": "NVDA",
                    "amount_ars": 90000,
                    "allocation_pct": 7,
                    "notes": "Refuerzo IA"
                }
            ]
        },
        {
            "month": 9,
            "label": "Septiembre",
            "orders": [
                {
                    "ticker": "KO",
                    "amount_ars": 90000,
                    "allocation_pct": 8,
                    "notes": "Refuerzo dividendos"
                },
                {
                    "ticker": "JNJ",
                    "amount_ars": 60000,
                    "allocation_pct": 7,
                    "notes": "Refuerzo salud"
                },
                {
                    "ticker": "GOOGL",
                    "amount_ars": 90000,
                    "allocation_pct": 5,
                    "notes": "Refuerzo tech"
                }
            ]
        },
        {
            "month": 10,
            "label": "Octubre",
            "orders": [
                {
                    "ticker": "PG",
                    "amount_ars": 75000,
                    "allocation_pct": 5,
                    "notes": "Refuerzo defensivo"
                },
                {
                    "ticker": "AAPL",
                    "amount_ars": 75000,
                    "allocation_pct": 5,
                    "notes": "Refuerzo Apple"
                },
                {
                    "ticker": "META",
                    "amount_ars": 90000,
                    "allocation_pct": 3,
                    "notes": "Refuerzo social"
                }
            ]
        },
        {
            "month": 11,
            "label": "Noviembre",
            "orders": [
                {
                    "ticker": "SCHD",
                    "amount_ars": 120000,
                    "allocation_pct": 20,
                    "notes": "Refuerzo SCHD"
                },
                {
                    "ticker": "O",
                    "amount_ars": 60000,
                    "allocation_pct": 3,
                    "notes": "Refuerzo REIT"
                },
                {
                    "ticker": "AMD",
                    "amount_ars": 90000,
                    "allocation_pct": 4,
                    "notes": "Refuerzo semiconductores"
                }
            ]
        },
        {
            "month": 12,
            "label": "Diciembre",
            "orders": [
                {
                    "ticker": "VYM",
                    "amount_ars": 120000,
                    "allocation_pct": 20,
                    "notes": "Cierre anio - refuerzo ETF"
                },
                {
                    "ticker": "WMT",
                    "amount_ars": 60000,
                    "allocation_pct": 4,
                    "notes": "Refuerzo retail"
                },
                {
                    "ticker": "MSFT",
                    "amount_ars": 90000,
                    "allocation_pct": 8,
                    "notes": "Cierre anio tech"
                }
            ]
        }
    ]
};

async function bootstrap() {
    const logger = new Logger('SeedScript');
    logger.log('🚀 Bootstrapping application context...');

    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const dataSource = app.get(DataSource);

        // Repositories
        const userRepo = dataSource.getRepository(User);
        const strategyRepo = dataSource.getRepository(Strategy);
        const scheduleRepo = dataSource.getRepository(StrategySchedule);

        // 1. Ensure User
        logger.log('👤 Ensuring user exists...');
        let user = await userRepo.findOne({ where: { email: 'admin@ovitec.com' } });
        if (!user) {
            user = userRepo.create({
                email: 'admin@ovitec.com',
                name: 'Admin Portfolio Manager',
                passwordHash: 'seeded',
                isActive: true,
            });
            user = await userRepo.save(user);
            logger.log(`✅ User created: ${user.email} (${user.id})`);
        } else {
            logger.log(`✅ User found: ${user.email} (${user.id})`);
        }

        // 2. Create Strategy
        logger.log('📈 Creating Strategy...');

        // Check if it already exists to overwrite/skip
        let strategy = await strategyRepo.findOne({ where: { name: strategyJson.strategy_info.name, user_id: user.id } });

        if (strategy) {
            logger.log(`♻️  Strategy already exists. Overwriting config.`);
            strategy.config = strategyJson;
            strategy.description = strategyJson.strategy_info.description;
            strategy.type = StrategyType.SCHEDULED;
            strategy.status = StrategyStatus.ACTIVE;
            strategy = await strategyRepo.save(strategy);
        } else {
            logger.log(`✨ Creating new Strategy...`);
            strategy = strategyRepo.create({
                user: user,
                user_id: user.id,
                name: strategyJson.strategy_info.name,
                description: strategyJson.strategy_info.description,
                type: StrategyType.SCHEDULED,
                status: StrategyStatus.ACTIVE,
                config: strategyJson, // the whole json
            });
            strategy = await strategyRepo.save(strategy);
        }
        logger.log(`✅ Strategy saved with ID: ${strategy.id}`);

        // 3. Create Schedule
        logger.log('🗓️  Creating Schedule...');
        let schedule = await scheduleRepo.findOne({ where: { strategy: { id: strategy.id } } });

        if (!schedule) {
            schedule = scheduleRepo.create({
                strategy: strategy,
                // Run on the 5th of every month at 10 AM
                cronExpression: '0 10 5 * *',
                timezone: 'America/Argentina/Buenos_Aires',
                isActive: true,
                // Setup next run manually or let nestjs handle it
                nextRunAt: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 10, 0, 0),
            });
            schedule = await scheduleRepo.save(schedule);
            logger.log(`✅ Schedule created with ID: ${schedule.id} (Cron: ${schedule.cronExpression})`);
        } else {
            logger.log(`✅ Schedule already exists for this strategy.`);
        }

        logger.log('🎉 Seed completed successfully!');
        await app.close();
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error during seed process', error);
        process.exit(1);
    }
}

bootstrap();
